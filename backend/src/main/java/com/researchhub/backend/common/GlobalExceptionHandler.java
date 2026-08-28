package com.researchhub.backend.common;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.bind.MissingServletRequestParameterException;
import org.springframework.web.multipart.MaxUploadSizeExceededException;
import org.springframework.web.multipart.support.MissingServletRequestPartException;
import org.springframework.web.HttpMediaTypeNotSupportedException;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;
import org.springframework.security.access.AccessDeniedException;

@RestControllerAdvice
public class GlobalExceptionHandler {
    private static final Logger log =
        LoggerFactory.getLogger(GlobalExceptionHandler.class);

    @ExceptionHandler(ApiException.class)
    public ResponseEntity<ApiErrorResponse> handleApiException(ApiException ex) {
        return ResponseEntity
            .status(ex.getStatus())
            .body(new ApiErrorResponse(new ApiError(ex.getMessage())));
    }

    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<ApiErrorResponse> handleAccessDenied(AccessDeniedException ex) {
        return ResponseEntity
            .status(403)
            .body(new ApiErrorResponse(new ApiError(ex.getMessage() != null ? ex.getMessage() : "Forbidden")));
    }

    @ExceptionHandler({
        MissingServletRequestParameterException.class,
        MissingServletRequestPartException.class,
        MethodArgumentTypeMismatchException.class,
        IllegalArgumentException.class
    })
    public ResponseEntity<ApiErrorResponse> handleBadRequest(Exception ex) {
        String message = ex instanceof IllegalArgumentException iae ? iae.getMessage() : ex.getMessage();
        return ResponseEntity.badRequest()
            .body(new ApiErrorResponse(new ApiError(message != null ? message : "Invalid request")));
    }

    @ExceptionHandler(MaxUploadSizeExceededException.class)
    public ResponseEntity<ApiErrorResponse> handleUploadTooLarge(MaxUploadSizeExceededException ex) {
        return ResponseEntity.status(413)
            .body(new ApiErrorResponse(new ApiError("Uploaded file is too large")));
    }

    @ExceptionHandler(HttpMediaTypeNotSupportedException.class)
    public ResponseEntity<ApiErrorResponse> handleUnsupportedMediaType(HttpMediaTypeNotSupportedException ex) {
        return ResponseEntity.status(415)
            .body(new ApiErrorResponse(new ApiError("Unsupported content type: " + ex.getMessage())));
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiErrorResponse> handleUnexpected(Exception ex) {
        log.error("Unhandled exception", ex);

        return ResponseEntity
            .internalServerError()
            .body(new ApiErrorResponse(new ApiError("An unexpected error occurred")));
    }
}
