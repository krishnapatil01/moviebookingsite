package com.cinematch.service;

import com.cinematch.entity.Show;
import com.cinematch.entity.Theater;
import com.cinematch.repository.ShowRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class RecommendationService {

    @Autowired
    private ShowRepository showRepository;

    public List<ShowRecommendation> getRecommendations(Long movieId, Map<String, Double> weights, String city) {
        List<Show> shows = showRepository.findByMovieId(movieId);

        return shows.stream()
            .filter(show -> city == null || show.getTheater().getCity().equalsIgnoreCase(city))
            .map(show -> {
                Theater theater = show.getTheater();
                double score = calculateScore(show, theater, weights);
                return new ShowRecommendation(show, score);
            })
            .sorted(Comparator.comparingDouble(ShowRecommendation::getScore).reversed())
            .collect(Collectors.toList());
    }

    private double calculateScore(Show show, Theater theater, Map<String, Double> weights) {
        double score = 0.0;

        // 1. Price Factor (Lower is better, normalized 1.0 - 5.0)
        double priceScore = normalizePrice(show.getBasePrice());
        score += priceScore * weights.getOrDefault("price", 1.0);

        // 2. Ambiance
        score += theater.getAmbianceScore() * weights.getOrDefault("ambiance", 1.0);

        // 3. Seat Comfort
        score += theater.getSeatComfort() * weights.getOrDefault("seatComfort", 1.0);

        // 4. A/V Quality
        score += theater.getAvQuality() * weights.getOrDefault("avQuality", 1.0);

        // 5. Food Quality
        score += theater.getFoodRating() * weights.getOrDefault("foodQuality", 1.0);

        // 6. Parking (Binary weight)
        if (theater.getParkingAvailable()) {
            score += 5.0 * weights.getOrDefault("parking", 1.0);
        }

        return score;
    }

    private double normalizePrice(Double price) {
        // Assume price range 100 - 1000. 100 -> 5.0, 1000 -> 1.0
        if (price == null) return 1.0;
        double normalized = 5.0 - ((price - 100) / 900.0 * 4.0);
        return Math.max(1.0, Math.min(5.0, normalized));
    }

    public static class ShowRecommendation {
        private ShowDTO show;
        private double score;

        public ShowRecommendation(Show show, double score) {
            this.show = new ShowDTO(show);
            this.score = score;
        }

        public ShowDTO getShow() { return show; }
        public double getScore() { return score; }
    }

    public static class ShowDTO {
        private Long id;
        private Double basePrice;
        private String startTime;
        private Integer availableSeats;
        private TheaterDTO theater;

        public ShowDTO(Show show) {
            this.id = show.getId();
            this.basePrice = show.getBasePrice();
            this.startTime = show.getStartTime().toString();
            this.availableSeats = show.getAvailableSeats();
            this.theater = new TheaterDTO(show.getTheater());
        }
        
        public Long getId() { return id; }
        public Double getBasePrice() { return basePrice; }
        public String getStartTime() { return startTime; }
        public Integer getAvailableSeats() { return availableSeats; }
        public TheaterDTO getTheater() { return theater; }
    }

    public static class TheaterDTO {
        private String name;
        private String city;

        public TheaterDTO(Theater theater) {
            this.name = theater.getName();
            this.city = theater.getCity();
        }

        public String getName() { return name; }
        public String getCity() { return city; }
    }
}
