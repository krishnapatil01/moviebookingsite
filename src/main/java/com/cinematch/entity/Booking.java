package com.cinematch.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "bookings")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Booking {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne
    @JoinColumn(name = "show_id", nullable = false)
    private Show show;

    private String seatsBooked; // Comma-separated: "A1,A2"
    private Double totalPrice;
    private String status = "PENDING"; // "PENDING", "CONFIRMED", "CANCELLED"
    private LocalDateTime bookingTime = LocalDateTime.now();
    private String transactionId; // Simulated from mock payment
}
