package com.duy.japankanji.service;

import com.duy.japankanji.dto.DeckRequest;
import com.duy.japankanji.dto.DeckResponse;
import com.duy.japankanji.entity.Deck;
import com.duy.japankanji.entity.User;
import com.duy.japankanji.entity.Vocabulary;
import com.duy.japankanji.repository.DeckRepository;
import com.duy.japankanji.repository.UserRepository;
import com.duy.japankanji.repository.VocabularyRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DeckService {

    private final DeckRepository deckRepository;
    private final UserRepository userRepository;
    private final VocabularyRepository vocabularyRepository;

    @Transactional(readOnly = true)
    public List<DeckResponse> getOfficialDecks() {
        return deckRepository.findByIsOfficialTrue().stream()
                .map(DeckResponse::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<DeckResponse> getCustomDecks(String username) {
        User user = userRepository.findByUsername(username).orElseThrow(() -> new RuntimeException("User not found"));
        return deckRepository.findByAuthorId(user.getId()).stream()
                .map(DeckResponse::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public DeckResponse getDeck(Long deckId) {
        Deck deck = deckRepository.findById(deckId).orElseThrow(() -> new RuntimeException("Deck not found"));
        return DeckResponse.fromEntity(deck);
    }

    @Transactional
    public DeckResponse createCustomDeck(String username, DeckRequest request) {
        User user = userRepository.findByUsername(username).orElseThrow(() -> new RuntimeException("User not found"));
        Deck deck = new Deck();
        deck.setTitle(request.title());
        deck.setDescription(request.description());
        deck.setIsOfficial(false);
        deck.setAuthor(user);
        
        deck = deckRepository.save(deck);
        return DeckResponse.fromEntity(deck);
    }

    @Transactional
    public DeckResponse updateCustomDeck(String username, Long deckId, DeckRequest request) {
        Deck deck = getDeckOwnedByUser(username, deckId);
        deck.setTitle(request.title());
        deck.setDescription(request.description());
        deck = deckRepository.save(deck);
        return DeckResponse.fromEntity(deck);
    }

    @Transactional
    public void deleteCustomDeck(String username, Long deckId) {
        Deck deck = getDeckOwnedByUser(username, deckId);
        deckRepository.deleteFromUserSavedDecks(deckId);
        deckRepository.delete(deck);
    }

    @Transactional
    public void addVocabularyToDeck(String username, Long deckId, Long vocabId) {
        Deck deck = getDeckOwnedByUser(username, deckId);
        Vocabulary vocabulary = vocabularyRepository.findById(vocabId)
                .orElseThrow(() -> new RuntimeException("Vocabulary not found"));
                
        deck.getVocabularies().add(vocabulary);
        deckRepository.save(deck);
    }

    @Transactional
    public void removeVocabularyFromDeck(String username, Long deckId, Long vocabId) {
        Deck deck = getDeckOwnedByUser(username, deckId);
        Vocabulary vocabulary = vocabularyRepository.findById(vocabId)
                .orElseThrow(() -> new RuntimeException("Vocabulary not found"));
                
        deck.getVocabularies().remove(vocabulary);
        deckRepository.save(deck);
    }
    
    private Deck getDeckOwnedByUser(String username, Long deckId) {
        Deck deck = deckRepository.findById(deckId).orElseThrow(() -> new RuntimeException("Deck not found"));
        if (!deck.getAuthor().getUsername().equals(username)) {
            throw new RuntimeException("Not authorized to modify this deck");
        }
        return deck;
    }


}
