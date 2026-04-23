package com.cinematch.controller;

import com.cinematch.entity.Theater;
import com.cinematch.service.RecommendationService;
import com.cinematch.repository.TheaterRepository;
import com.cinematch.repository.ShowRepository;
import com.cinematch.entity.Show;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/theaters")
@CrossOrigin(origins = "*")
public class TheaterController {

    @Autowired
    private TheaterRepository theaterRepository;

    @Autowired
    private ShowRepository showRepository;

    @Autowired
    private RecommendationService recommendationService;

    @GetMapping
    public List<Theater> getAllTheaters() {
        return theaterRepository.findAll();
    }

    @GetMapping("/movie/{movieId}")
    public List<Show> getShowsForMovie(@PathVariable Long movieId) {
        return showRepository.findByMovieId(movieId);
    }

    @PostMapping("/recommend/{movieId}")
    public List<RecommendationService.ShowRecommendation> recommendTheaters(
            @PathVariable Long movieId,
            @RequestBody Map<String, Double> weights,
            @RequestParam(required = false) String city) {
        return recommendationService.getRecommendations(movieId, weights, city);
    }

    @GetMapping("/show/{showId}")
    public Show getShowById(@PathVariable Long showId) {
        return showRepository.findById(showId)
                .orElseThrow(() -> new RuntimeException("Show not found"));
    }
}
