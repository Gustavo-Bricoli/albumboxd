package com.gustavo.album_boxd_api;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class HomeController {

	@GetMapping("/login")
	public String redirectOldLoginUrl() {
		return "redirect:/";
	}
}
