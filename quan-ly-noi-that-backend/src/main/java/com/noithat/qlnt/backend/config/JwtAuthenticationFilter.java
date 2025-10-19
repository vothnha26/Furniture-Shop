package com.noithat.qlnt.backend.config;

import com.noithat.qlnt.backend.service.JwtService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtService jwtService;
    private final UserDetailsService userDetailsService;

    @Override
    protected void doFilterInternal(
            @NonNull HttpServletRequest request,
            @NonNull HttpServletResponse response,
            @NonNull FilterChain filterChain
    ) throws ServletException, IOException {
        final String authHeader = request.getHeader("Authorization");
        System.out.println("[JwtFilter] Request: " + request.getMethod() + " " + request.getRequestURI());
        System.out.println("[JwtFilter] Authorization header: " + (authHeader != null ? authHeader.substring(0, Math.min(20, authHeader.length())) + "..." : "NULL"));
        
        final String jwt;
        final String username;
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            System.out.println("[JwtFilter] No valid Bearer token found - skipping authentication");
            filterChain.doFilter(request, response);
            return;
        }
        jwt = authHeader.substring(7).trim();

        // Quick guard: if token looks like a template placeholder or is obviously invalid, skip
        if (jwt.startsWith("{{") && jwt.endsWith("}}")) {
            System.out.println("[JwtFilter] Authorization contains template placeholder - skipping JWT parsing");
            filterChain.doFilter(request, response);
            return;
        }

        // Basic structural check: JWT must contain exactly two periods separating header.payload.signature
        int dotCount = 0;
        for (char c : jwt.toCharArray()) if (c == '.') dotCount++;
        if (dotCount != 2) {
            System.err.println("[JwtFilter] Malformed JWT (incorrect number of segments): found " + dotCount + " - skipping authentication");
            filterChain.doFilter(request, response);
            return;
        }

        username = jwtService.extractUsername(jwt);
        System.out.println("[JwtFilter] Extracted username from JWT: " + username);
        
        // Check if there's already an authentication (could be anonymousUser)
        if (SecurityContextHolder.getContext().getAuthentication() != null) {
            System.out.println("[JwtFilter] Existing authentication found: " + SecurityContextHolder.getContext().getAuthentication().getName() + " - will override with JWT auth");
        }
        
        if (username != null) {
            try {
                System.out.println("[JwtFilter] Loading user details for username: " + username);
                UserDetails userDetails = this.userDetailsService.loadUserByUsername(username);
                System.out.println("[JwtFilter] UserDetails loaded: " + (userDetails != null ? userDetails.getUsername() : "NULL"));
                
                boolean isValid = jwtService.isTokenValid(jwt, userDetails);
                System.out.println("[JwtFilter] Token valid check result: " + isValid);
                
                if (isValid) {
                    System.out.println("[JwtFilter] Token is valid - setting authentication for user: " + username);
                    UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                            userDetails,
                            null,
                            userDetails.getAuthorities()
                    );
                    authToken.setDetails(
                            new WebAuthenticationDetailsSource().buildDetails(request)
                    );
                    SecurityContextHolder.getContext().setAuthentication(authToken);
                    System.out.println("[JwtFilter] Authentication set successfully. Principal: " + SecurityContextHolder.getContext().getAuthentication().getName());
                } else {
                    System.err.println("[JwtFilter] Token validation failed for user: " + username);
                }
            } catch (Exception e) {
                System.err.println("[JwtFilter] Error during authentication: " + e.getMessage());
                e.printStackTrace();
            }
        } else {
            System.err.println("[JwtFilter] Username is null after extraction");
        }
        filterChain.doFilter(request, response);
    }
}