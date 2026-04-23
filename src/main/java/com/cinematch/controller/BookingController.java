package com.cinematch.controller;

import com.cinematch.entity.Booking;
import com.cinematch.entity.Show;
import com.cinematch.entity.User;
import com.cinematch.repository.BookingRepository;
import com.cinematch.repository.ShowRepository;
import com.cinematch.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/bookings")
@CrossOrigin(origins = "*")
public class BookingController {

    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private ShowRepository showRepository;

    @Autowired
    private UserRepository userRepository;

    @PostMapping
    public Booking createBooking(@RequestBody BookingRequest bookingRequest) {
        Show show = showRepository.findById(bookingRequest.getShowId())
                .orElseThrow(() -> new RuntimeException("Show not found"));

        // Check if specific seats are already booked using strict matching
        String currentMap = show.getSeatStatusMap() == null ? "" : show.getSeatStatusMap();
        List<String> occupiedSeats = Arrays.asList(currentMap.split(","));
        String[] requestedSeats = bookingRequest.getSeats().split(",");
        
        for (String seat : requestedSeats) {
            String trimmedSeat = seat.trim();
            if (!trimmedSeat.isEmpty() && occupiedSeats.contains(trimmedSeat)) {
                throw new RuntimeException("Seat " + trimmedSeat + " is already booked!");
            }
        }

        // Mock current user (In real app, get from SecurityContext)
        User user = userRepository.findById(1L).orElseGet(() -> {
            User newUser = new User(null, "guest", "guest@example.com", "password", "USER", "{}");
            return userRepository.save(newUser);
        });

        if (show.getAvailableSeats() < bookingRequest.getSeatCount()) {
            throw new RuntimeException("Not enough seats available");
        }

        // Update show seats and status map
        show.setAvailableSeats(show.getAvailableSeats() - bookingRequest.getSeatCount());
        String newMap = currentMap.isEmpty() ? bookingRequest.getSeats() : currentMap + "," + bookingRequest.getSeats();
        show.setSeatStatusMap(newMap);
        showRepository.save(show);

        Booking booking = new Booking();
        booking.setUser(user);
        booking.setShow(show);
        booking.setSeatsBooked(bookingRequest.getSeats());
        booking.setTotalPrice(show.getBasePrice() * bookingRequest.getSeatCount());
        booking.setStatus("CONFIRMED");
        booking.setBookingTime(LocalDateTime.now());
        booking.setTransactionId("TXN-" + UUID.randomUUID().toString().substring(0, 8));

        return bookingRepository.save(booking);
    }

    @GetMapping("/user/{userId}")
    public List<Booking> getUserBookings(@PathVariable Long userId) {
        return bookingRepository.findByUserId(userId);
    }

    public static class BookingRequest {
        private Long showId;
        private String seats; // e.g., "A1,A2"
        private Integer seatCount;

        // Getters and Setters
        public Long getShowId() { return showId; }
        public void setShowId(Long showId) { this.showId = showId; }
        public String getSeats() { return seats; }
        public void setSeats(String seats) { this.seats = seats; }
        public Integer getSeatCount() { return seatCount; }
        public void setSeatCount(Integer seatCount) { this.seatCount = seatCount; }
    }
}
