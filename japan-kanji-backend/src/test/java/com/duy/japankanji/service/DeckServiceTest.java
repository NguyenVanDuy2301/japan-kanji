package com.duy.japankanji.service;

import com.duy.japankanji.dto.DeckRequest;
import com.duy.japankanji.dto.DeckResponse;
import com.duy.japankanji.entity.Deck;
import com.duy.japankanji.entity.User;
import com.duy.japankanji.repository.DeckRepository;
import com.duy.japankanji.repository.UserRepository;
import com.duy.japankanji.repository.VocabularyRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class DeckServiceTest {

    @Mock
    private DeckRepository deckRepository;
    
    @Mock
    private UserRepository userRepository;
    
    @Mock
    private VocabularyRepository vocabularyRepository;

    @InjectMocks
    private DeckService deckService;

    @Test
    void createCustomDeck_ShouldCreateAndReturnDeck_WhenUserExists() {
        // Arrange
        String username = "testuser";
        DeckRequest request = new DeckRequest("My Custom Deck", "My Description");
        
        User user = new User();
        user.setId(1L);
        user.setUsername(username);
        
        when(userRepository.findByUsername(username)).thenReturn(Optional.of(user));
        
        // Mock save to return the deck with an ID
        when(deckRepository.save(any(Deck.class))).thenAnswer(invocation -> {
            Deck savedDeck = invocation.getArgument(0);
            savedDeck.setId(100L); // simulate DB generating ID
            return savedDeck;
        });

        // Act
        DeckResponse response = deckService.createCustomDeck(username, request);

        // Assert
        assertNotNull(response);
        assertEquals(100L, response.id());
        assertEquals("My Custom Deck", response.title());
        assertEquals("My Description", response.description());
        
        // Verify that the repository was called with the correct entity state
        ArgumentCaptor<Deck> deckCaptor = ArgumentCaptor.forClass(Deck.class);
        verify(deckRepository).save(deckCaptor.capture());
        Deck capturedDeck = deckCaptor.getValue();
        
        assertEquals("My Custom Deck", capturedDeck.getTitle());
        assertEquals("My Description", capturedDeck.getDescription());
        assertFalse(capturedDeck.getIsOfficial());
        assertEquals(user, capturedDeck.getAuthor());
    }

    @Test
    void createCustomDeck_ShouldThrowException_WhenUserNotFound() {
        // Arrange
        String username = "unknown_user";
        DeckRequest request = new DeckRequest("Title", "Desc");
        
        when(userRepository.findByUsername(username)).thenReturn(Optional.empty());
        
        // Act & Assert
        RuntimeException exception = assertThrows(RuntimeException.class, () -> {
            deckService.createCustomDeck(username, request);
        });
        
        assertEquals("User not found", exception.getMessage());
        verify(deckRepository, never()).save(any());
    }

    @Test
    void deleteCustomDeck_ShouldDeleteDeck_WhenUserIsAuthor() {
        // Arrange
        String username = "author";
        Long deckId = 1L;
        
        User user = new User();
        user.setUsername(username);
        
        Deck deck = new Deck();
        deck.setId(deckId);
        deck.setAuthor(user);
        
        when(deckRepository.findById(deckId)).thenReturn(Optional.of(deck));
        
        // Act
        deckService.deleteCustomDeck(username, deckId);
        
        // Assert
        verify(deckRepository).deleteFromUserSavedDecks(deckId);
        verify(deckRepository).delete(deck);
    }

    @Test
    void deleteCustomDeck_ShouldThrowException_WhenUserIsNotAuthor() {
        // Arrange
        String username = "not_author";
        Long deckId = 1L;
        
        User author = new User();
        author.setUsername("real_author");
        
        Deck deck = new Deck();
        deck.setId(deckId);
        deck.setAuthor(author);
        
        when(deckRepository.findById(deckId)).thenReturn(Optional.of(deck));
        
        // Act & Assert
        RuntimeException exception = assertThrows(RuntimeException.class, () -> {
            deckService.deleteCustomDeck(username, deckId);
        });
        
        assertEquals("Not authorized to modify this deck", exception.getMessage());
        verify(deckRepository, never()).deleteFromUserSavedDecks(any());
        verify(deckRepository, never()).delete(any());
    }

}
