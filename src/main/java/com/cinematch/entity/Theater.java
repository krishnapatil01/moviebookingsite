package com.cinematch.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@Entity
@Table(name = "theaters")
@Data
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Theater {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    private String city;
    private Double latitude;
    private Double longitude;

    // Ranking Criteria (Scores from 1.0 to 5.0)
    private Double ambianceScore = 3.0;
    private Double seatComfort = 3.0;
    private Double avQuality = 3.0;
    private Double foodRating = 3.0;
    private Boolean parkingAvailable = true;
}
