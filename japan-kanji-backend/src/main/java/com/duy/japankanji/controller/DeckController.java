package com.duy.japankanji.controller;

import com.duy.japankanji.dto.DeckRequest;
import com.duy.japankanji.dto.DeckResponse;
import com.duy.japankanji.service.DeckService;
import com.duy.japankanji.service.UserLibraryService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/decks")
@CrossOrigin(origins = "http://localhost:5173")
public class DeckController {

    private final DeckService deckService;
    private final UserLibraryService userLibraryService;

    public DeckController(DeckService deckService, UserLibraryService userLibraryService) {
        this.deckService = deckService;
        this.userLibraryService = userLibraryService;
    }

    @GetMapping("/official")
    public ResponseEntity<List<DeckResponse>> getOfficialDecks() {
        return ResponseEntity.ok(deckService.getOfficialDecks());
    }

    @GetMapping("/custom")
    public ResponseEntity<List<DeckResponse>> getCustomDecks(Authentication authentication) {
        return ResponseEntity.ok(deckService.getCustomDecks(authentication.getName()));
    }

    @GetMapping("/{deckId}")
    public ResponseEntity<DeckResponse> getDeck(@PathVariable Long deckId) {
        return ResponseEntity.ok(deckService.getDeck(deckId));
    }

    @PostMapping
    public ResponseEntity<DeckResponse> createCustomDeck(@Valid @RequestBody DeckRequest request, Authentication authentication) {
        return ResponseEntity.ok(deckService.createCustomDeck(authentication.getName(), request));
    }

    @PutMapping("/{deckId}")
    public ResponseEntity<DeckResponse> updateCustomDeck(
            @PathVariable Long deckId,
            @Valid @RequestBody DeckRequest request,
            Authentication authentication) {
        return ResponseEntity.ok(deckService.updateCustomDeck(authentication.getName(), deckId, request));
    }

    @DeleteMapping("/{deckId}")
    public ResponseEntity<Void> deleteCustomDeck(
            @PathVariable Long deckId,
            Authentication authentication) {
        deckService.deleteCustomDeck(authentication.getName(), deckId);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/{deckId}/vocabularies/{vocabId}")
    public ResponseEntity<Void> addVocabularyToDeck(
            @PathVariable Long deckId,
            @PathVariable Long vocabId,
            Authentication authentication) {
        deckService.addVocabularyToDeck(authentication.getName(), deckId, vocabId);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{deckId}/vocabularies/{vocabId}")
    public ResponseEntity<Void> removeVocabularyFromDeck(
            @PathVariable Long deckId,
            @PathVariable Long vocabId,
            Authentication authentication) {
        deckService.removeVocabularyFromDeck(authentication.getName(), deckId, vocabId);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/saved")
    public ResponseEntity<List<DeckResponse>> getSavedDecks(Authentication authentication) {
        return ResponseEntity.ok(userLibraryService.getSavedDecks(authentication.getName()));
    }

    @PostMapping("/{deckId}/save")
    public ResponseEntity<Void> saveDeck(@PathVariable Long deckId, Authentication authentication) {
        userLibraryService.saveDeck(authentication.getName(), deckId);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{deckId}/save")
    public ResponseEntity<Void> unsaveDeck(@PathVariable Long deckId, Authentication authentication) {
        userLibraryService.unsaveDeck(authentication.getName(), deckId);
        return ResponseEntity.ok().build();
    }
}
