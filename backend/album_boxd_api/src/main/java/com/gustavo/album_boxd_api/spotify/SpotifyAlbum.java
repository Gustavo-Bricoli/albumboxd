package com.gustavo.album_boxd_api.spotify;

import java.util.List;

public record SpotifyAlbum(
		String id,
		String name,
		String artist,
		String releaseDate,
		int totalTracks,
		String imageUrl,
		String spotifyUrl,
		List<String> genres) {
}
