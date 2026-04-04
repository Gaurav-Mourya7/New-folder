package com.hms.GatewayMS.filter;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import org.springframework.cloud.gateway.filter.GatewayFilter;
import org.springframework.cloud.gateway.filter.factory.AbstractGatewayFilterFactory;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.stereotype.Component;

@Component
public class TokenFilter extends AbstractGatewayFilterFactory<TokenFilter.Config> {

    private static final String SECRET_KEY = "692986b394460ccb9f0076f0588c3f061020aa585d748e34a22c2aca86accf6181e1b655d9fa0fa35c9ba5f586962b4be6ce1340a2d50eca108ec8b0c40490b7";

    public TokenFilter() {
        super(Config.class);
    }

    @Override
    public GatewayFilter apply(Config config) {
        return (exchange, chain) -> {
            // Let CORS preflight requests pass through without auth checks.
            if (exchange.getRequest().getMethod() == HttpMethod.OPTIONS) {
                return chain.filter(exchange);
            }
            String path = exchange.getRequest().getPath().toString();
            if (path.contains("/user/login") || path.contains("/user/register")) {
                return chain.filter(exchange.mutate().request(r->r.header("X-Secret-Key",SECRET_KEY)).build());
            }
            HttpHeaders header = exchange.getRequest().getHeaders();
            if (!header.containsKey(HttpHeaders.AUTHORIZATION)) {
                throw new RuntimeException("Authorization header is missing");
            }
            String authHeader = header.getFirst(HttpHeaders.AUTHORIZATION);
            if (authHeader==null||!authHeader.startsWith("Bearer ")){
                throw new RuntimeException("Authorization header is invalid");
            }
            String token =authHeader.substring(7);
            try{
                Claims claims = Jwts.parserBuilder()
                        .setSigningKey(SECRET_KEY)
                        .build()
                        .parseClaimsJws(token)
                        .getBody();
                exchange = exchange.mutate().request(r->r.header("X-Secret-Key",SECRET_KEY)).build();
            }
            catch (Exception e){
                throw new RuntimeException("Token is unavailable");
            }
            return chain.filter(exchange);
        };
    }

    public static class Config {

    }
}