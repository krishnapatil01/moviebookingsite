package com.cinematch.util;

import com.cinematch.entity.*;
import com.cinematch.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;

@Component
public class DataInitializer implements CommandLineRunner {

    @Autowired
    private MovieRepository movieRepository;

    @Autowired
    private TheaterRepository theaterRepository;

    @Autowired
    private ShowRepository showRepository;

    @Override
    public void run(String... args) throws Exception {
        // Only seed if the database is empty
        if (movieRepository.count() > 0) return;

        // Sample Movies
        // Hollywood
        Movie m1 = new Movie(null, "Dune: Part Two", "Sci-Fi", "English", LocalDate.of(2024, 3, 1), 4.8, 166, "Epic sci-fi adventure.", "https://images.unsplash.com/photo-1626814026160-2237a95fc5a0?q=80&w=400", "https://www.youtube.com/watch?v=Way9Dexny3w");
        Movie m2 = new Movie(null, "Oppenheimer", "Biography", "English", LocalDate.of(2023, 7, 21), 4.9, 180, "The Manhattan Project story.", "https://images.unsplash.com/photo-1440404653325-ab127d49abc1?q=80&w=400", "https://www.youtube.com/watch?v=uYPbbksJxIg");
        
        // Bollywood
        Movie m3 = new Movie(null, "Pathaan", "Action, Thriller", "Hindi", LocalDate.of(2023, 1, 25), 4.5, 146, "A RAW agent comes out of exile to stop a terrorist group.", "https://images.unsplash.com/photo-1536440136628-849c177e76a1?q=80&w=400", "https://www.youtube.com/watch?v=vqu4z34wENw");
        Movie m4 = new Movie(null, "Crew", "Comedy, Drama", "Hindi", LocalDate.of(2024, 3, 29), 4.2, 120, "Three air-hostesses take on a heist in the airline industry.", "https://images.unsplash.com/photo-1485846234645-a62644f84728?q=80&w=400", "https://www.youtube.com/watch?v=T3vS63f76fA");

        // Marathi
        Movie m5 = new Movie(null, "Ved", "Romance, Drama", "Marathi", LocalDate.of(2022, 12, 30), 4.6, 140, "A story of unrequited love and second chances.", "https://images.unsplash.com/photo-1594908900066-3f47337549d8?q=80&w=400", "https://www.youtube.com/watch?v=fW_5nAnfMxs");
        Movie m6 = new Movie(null, "Sairat", "Musical, Drama", "Marathi", LocalDate.of(2016, 4, 29), 4.9, 174, "A classic tale of forbidden love.", "https://images.unsplash.com/photo-1626814026160-2237a95fc5a0?q=80&w=400", "https://www.youtube.com/watch?v=wMrMKnoWskc");

        // South Indian (Pan-India)
        Movie m7 = new Movie(null, "KGF: Chapter 2", "Action", "Kannada", LocalDate.of(2022, 4, 14), 4.8, 168, "Rocky takes control of Kolar Gold Fields.", "https://images.unsplash.com/photo-1509248961158-e54f6934749c?q=80&w=400", "https://www.youtube.com/watch?v=JKa05nyU8Qo");
        Movie m8 = new Movie(null, "Pushpa: The Rise", "Action, Drama", "Telugu", LocalDate.of(2021, 12, 17), 4.7, 179, "Rise of a low-level worker in the red sandalwood smuggling.", "https://images.unsplash.com/photo-1536440136628-849c177e76a1?q=80&w=400", "https://www.youtube.com/watch?v=Q1NKMPhP8PY");
        
        List<Movie> allMovies = Arrays.asList(m1, m2, m3, m4, m5, m6, m7, m8);
        movieRepository.saveAll(allMovies);

        // State & City-based Theaters
        Theater t1 = new Theater(null, "PVR Superplex", "Mumbai", 19.076, 72.877, 4.8, 4.9, 5.0, 4.5, true);
        Theater t2 = new Theater(null, "INOX Insignia", "Mumbai", 19.117, 72.848, 4.9, 5.0, 4.7, 4.8, true);
        Theater p1 = new Theater(null, "E-Square Aurora", "Pune", 18.520, 73.856, 4.2, 4.0, 4.5, 4.0, true);
        Theater p2 = new Theater(null, "CityPride Kothrud", "Pune", 18.507, 73.807, 4.0, 3.8, 4.0, 3.5, true);
        Theater b1 = new Theater(null, "The Orion Mall", "Bangalore", 12.971, 77.594, 5.0, 5.0, 5.0, 5.0, true);
        Theater d1 = new Theater(null, "PVR Select Citywalk", "New Delhi", 28.528, 77.219, 4.9, 4.8, 4.9, 4.7, true);
        
        List<Theater> allTheaters = Arrays.asList(t1, t2, p1, p2, b1, d1);
        theaterRepository.saveAll(allTheaters);

        // Generate Shows for EVERY movie in EVERY theater
        LocalDateTime baseTime = LocalDateTime.now().withHour(10).withMinute(0);
        for (Movie movie : allMovies) {
            for (Theater theater : allTheaters) {
                // Vary price based on theater city
                double price = theater.getCity().equals("Mumbai") ? 600.0 : 400.0;
                if (theater.getName().contains("Insignia") || theater.getName().contains("Select")) price += 300.0;
                
                showRepository.save(new Show(null, movie, theater, baseTime.plusHours(4), price, 40, 40, ""));
                showRepository.save(new Show(null, movie, theater, baseTime.plusHours(9), price - 50, 40, 40, ""));
            }
        }
    }
}
