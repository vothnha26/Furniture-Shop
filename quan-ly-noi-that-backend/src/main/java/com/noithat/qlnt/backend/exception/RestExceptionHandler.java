package com.noithat.qlnt.backend.exception;

import com.fasterxml.jackson.core.JsonParseException;
import com.fasterxml.jackson.databind.exc.InvalidFormatException;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;
import org.springframework.lang.NonNull;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.context.request.WebRequest;
import org.springframework.web.servlet.mvc.method.annotation.ResponseEntityExceptionHandler;

import java.util.HashMap;
import java.util.Map;

@ControllerAdvice
public class RestExceptionHandler extends ResponseEntityExceptionHandler {

    @Override
    protected ResponseEntity<Object> handleHttpMessageNotReadable(@NonNull HttpMessageNotReadableException ex, @NonNull HttpHeaders headers, @NonNull HttpStatusCode status, @NonNull WebRequest request) {
        Throwable cause = ex.getCause();
        String details = ex.getMessage();
        if (cause instanceof JsonParseException) {
            details = "JSON parse error: " + cause.getMessage();
        } else if (cause instanceof InvalidFormatException) {
            details = "Invalid format: " + cause.getMessage();
        }

        Map<String, Object> body = new HashMap<>();
        body.put("details", details);
        body.put("error", "Lỗi dữ liệu đầu vào");
        body.put("message", "Yêu cầu không hợp lệ");
        body.put("status", 400);

        headers.setContentType(MediaType.APPLICATION_JSON);
        return new ResponseEntity<>(body, headers, HttpStatus.BAD_REQUEST);
    }

    @Override
    protected ResponseEntity<Object> handleMethodArgumentNotValid(@NonNull MethodArgumentNotValidException ex, @NonNull HttpHeaders headers, @NonNull HttpStatusCode status, @NonNull WebRequest request) {
        Map<String, Object> body = new HashMap<>();
        
        // Format details as object with field -> message mapping
        Map<String, String> fieldErrors = new HashMap<>();
        ex.getBindingResult().getFieldErrors().forEach(fe -> 
            fieldErrors.put(fe.getField(), fe.getDefaultMessage())
        );

        body.put("details", fieldErrors);
        body.put("error", "Lỗi validation");
        body.put("message", "Dữ liệu đầu vào không hợp lệ");
        body.put("status", 400);

        headers.setContentType(MediaType.APPLICATION_JSON);
        return new ResponseEntity<>(body, headers, HttpStatus.BAD_REQUEST);
    }
    
    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<Object> handleIllegalArgumentException(IllegalArgumentException ex, WebRequest request) {
        Map<String, Object> body = new HashMap<>();
        body.put("details", ex.getMessage());
        body.put("error", "Lỗi validation");
        body.put("message", "Dữ liệu đầu vào không hợp lệ");
        body.put("status", 400);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        return new ResponseEntity<>(body, headers, HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<Object> handleAll(Exception ex, WebRequest request) {
        Map<String, Object> body = new HashMap<>();
        body.put("details", ex.getMessage());
        body.put("error", "Lỗi hệ thống");
        body.put("message", "Đã xảy ra lỗi không mong muốn");
        body.put("status", 500);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        return new ResponseEntity<>(body, headers, HttpStatus.INTERNAL_SERVER_ERROR);
    }
}
