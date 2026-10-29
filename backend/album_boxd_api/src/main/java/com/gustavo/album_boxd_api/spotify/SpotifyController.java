package com.gustavo.album_boxd_api.spotify;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

@RestController
public class SpotifyController {

	private final SpotifyService spotifyService;

	public SpotifyController(SpotifyService spotifyService) {
		this.spotifyService = spotifyService;
	}

	@GetMapping("/api/albums")
	public SpotifyAlbumsResponse searchAlbums(
			@RequestParam(defaultValue = "year:2024") String query,
			@RequestParam(defaultValue = "10") int limit,
			@RequestParam(defaultValue = "0") int offset) {
		if (query.isBlank() || limit < 1 || limit > 10 || offset < 0) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
					"Query must not be blank, limit must be between 1 and 10, and offset must not be negative.");
		}
		try {
			return spotifyService.searchAlbums(query, limit, offset);
		} catch (SpotifyApiException exception) {
			throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, exception.getMessage(), exception);
		}
	}
}
