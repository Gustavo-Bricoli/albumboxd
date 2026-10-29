package com.gustavo.album_boxd_api.spotify;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestClientResponseException;
import org.springframework.web.util.UriComponentsBuilder;

import com.fasterxml.jackson.databind.JsonNode;

@Service
public class SpotifyService {

	private final RestClient restClient;
	private final String clientId;
	private final String clientSecret;
	private String accessToken;
	private Instant tokenExpiresAt = Instant.MIN;

	public SpotifyService(
			RestClient.Builder restClientBuilder,
			@Value("${spotify.client-id:}") String clientId,
			@Value("${spotify.client-secret:}") String clientSecret) {
		this.restClient = restClientBuilder.build();
		this.clientId = clientId;
		this.clientSecret = clientSecret;
	}

	public SpotifyAlbumsResponse searchAlbums(String query, int limit, int offset) {
		validateConfiguration();

		try {
			JsonNode response = restClient.get()
					.uri(UriComponentsBuilder
							.fromUriString("https://api.spotify.com/v1/search")
							.queryParam("q", query)
							.queryParam("type", "album")
							.queryParam("limit", limit)
							.queryParam("offset", offset)
							.encode()
							.toUriString())
					.headers(headers -> headers.setBearerAuth(getAccessToken()))
					.retrieve()
					.body(JsonNode.class);

			return toAlbumsResponse(response);
		} catch (RestClientResponseException exception) {
			throw new SpotifyApiException("Spotify returned HTTP " + exception.getStatusCode().value()
					+ ": " + exception.getResponseBodyAsString(), exception);
		} catch (RestClientException exception) {
			throw new SpotifyApiException("Spotify could not be reached", exception);
		}
	}

	private synchronized String getAccessToken() {
		if (accessToken != null && Instant.now().isBefore(tokenExpiresAt)) {
			return accessToken;
		}

		var form = new LinkedMultiValueMap<String, String>();
		form.add("grant_type", "client_credentials");

		try {
			JsonNode response = restClient.post()
					.uri("https://accounts.spotify.com/api/token")
					.contentType(MediaType.APPLICATION_FORM_URLENCODED)
					.headers(headers -> headers.setBasicAuth(clientId, clientSecret))
					.body(form)
					.retrieve()
					.body(JsonNode.class);

			accessToken = response.path("access_token").asText(null);
			long expiresIn = response.path("expires_in").asLong(3600);
			if (accessToken == null || accessToken.isBlank()) {
				throw new SpotifyApiException("Spotify did not return an access token");
			}
			tokenExpiresAt = Instant.now().plusSeconds(Math.max(60, expiresIn - 60));
			return accessToken;
		} catch (RestClientResponseException exception) {
			throw new SpotifyApiException("Spotify authentication failed with HTTP "
					+ exception.getStatusCode().value() + ": " + exception.getResponseBodyAsString(), exception);
		} catch (RestClientException exception) {
			throw new SpotifyApiException("Spotify authentication could not be completed", exception);
		}
	}

	private SpotifyAlbumsResponse toAlbumsResponse(JsonNode response) {
		List<SpotifyAlbum> albums = new ArrayList<>();
		for (JsonNode item : response.path("albums").path("items")) {
			List<String> artists = new ArrayList<>();
			for (JsonNode artist : item.path("artists")) {
				artists.add(artist.path("name").asText());
			}

			String imageUrl = item.path("images").path(0).path("url").asText("");
			String spotifyUrl = item.path("external_urls").path("spotify").asText("");
			albums.add(new SpotifyAlbum(
					item.path("id").asText(),
					item.path("name").asText(),
					String.join(", ", artists),
					item.path("release_date").asText(),
					item.path("total_tracks").asInt(),
					imageUrl,
					spotifyUrl,
					List.of()));
		}
		return new SpotifyAlbumsResponse(
				albums,
				response.path("albums").path("total").asInt(albums.size()),
				response.path("albums").path("offset").asInt(0));
	}

	private void validateConfiguration() {
		if (clientId.isBlank() || clientSecret.isBlank()) {
			throw new SpotifyApiException(
					"Spotify is not configured. Set SPOTIFY_CLIENT_ID and SPOTIFY_CLIENT_SECRET.");
		}
	}
}
