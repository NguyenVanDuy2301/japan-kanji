package com.duy.japankanji.event;

import lombok.Getter;
import org.springframework.context.ApplicationEvent;

@Getter
public class VocabularyLearnedEvent extends ApplicationEvent {
    private final Long userId;
    private final String jlptLevel;

    public VocabularyLearnedEvent(Object source, Long userId, String jlptLevel) {
        super(source);
        this.userId = userId;
        this.jlptLevel = jlptLevel;
    }
}
