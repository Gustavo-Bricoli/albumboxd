package com.gustavo.album_boxd_api.spotify;

import java.util.List;

public record SpotifyAlbumsResponse(List<SpotifyAlbum> albums, int total, int offset) {
}
