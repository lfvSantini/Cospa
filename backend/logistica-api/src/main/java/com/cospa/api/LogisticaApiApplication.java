package com.cospa.api;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class LogisticaApiApplication {

    public static void main(String[] args) {
        SpringApplication.run(LogisticaApiApplication.class, args);
    }
}