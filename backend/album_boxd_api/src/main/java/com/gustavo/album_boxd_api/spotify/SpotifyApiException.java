package com.gustavo.album_boxd_api.spotify;

public class SpotifyApiException extends RuntimeException {

	public SpotifyApiException(String message) {
		super(message);
	}

	public SpotifyApiException(String message, Throwable cause) {
		super(message, cause);
	}
}
