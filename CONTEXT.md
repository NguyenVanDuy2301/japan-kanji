# Japan Kanji Context

Domain model and glossary for the Japan Kanji learning platform.

## Language

**Vocabulary / Kanji**:
A Japanese Kanji character (or vocabulary word) entry with its Onyomi, Kunyomi, Sino-Vietnamese translation, meaning, JLPT level, and examples.
_Avoid_: Word, DictItem. (Note: Flashcard is used strictly in the context of studying a Deck).

**Deck**:
A collection of vocabulary items grouped together for studying (like a course or folder).
_Avoid_: Course, Folder, List.

**Official Deck**:
A Deck curated and managed by the Admin. Contains standardized Vocabulary. Visible and study-able by all Users.

**Custom Deck**:
A Deck created by a User. It operates on an "Unlisted" model: it does not appear in any public community directory to prevent clutter, but the author can share its unique URL (Share Link) with others (e.g., a teacher sharing with students) allowing them to study it. A Custom Deck is strictly a collection of *existing* Vocabulary items from the global dictionary; Users cannot create custom/unverified words.

**Sino-Vietnamese (sinoVietnamese)**:
The Sino-Vietnamese phonetic reading (Âm Hán Việt) of the kanji characters in a vocabulary item (e.g., HÁN TỰ for 漢字).
_Avoid_: HanViet, SinoReading, KanjiReading

**User Role**:
An authorization level for a User. Currently either `USER` (default, can learn and view vocabulary) or `ADMIN` (can manage shared vocabulary).
_Avoid_: Privilege, Authority.

**Vocabulary Deletion**:
The process of removing a vocabulary item. Currently implemented as a "Block Deletion" (preventing deletion if the word is being studied by any user) rather than a Soft Delete. This is an intentional decision for simplicity at the current scale, and can be upgraded to Soft Delete later if we need to filter "hidden" words from the main list.
_Avoid_: Hard Delete, Cascade Delete.

**Authentication State**:
The client-side representation of a logged-in user. We store the JWT token in LocalStorage (acceptable trade-off against XSS for simplicity) and manage global access to the current user's profile (`userId`, `username`) via React Context.
_Avoid_: Session Cookie, Redux Auth Store.

**Learning Progress (SRS)**:
The state of a User's mastery over a specific `Vocabulary` item. Because this progress is tied to the `Vocabulary` itself (not the `Deck`), if a user learns a word in one Deck, that progress is globally synced across all other Decks containing that word.

**Lesson**:
The initial learning phase for a new Vocabulary item. Uses a passive, self-paced "flip card" interface to introduce the kanji, reading, and meaning.

**Review**:
The active recall phase for a previously learned Vocabulary item (Spaced Repetition). Uses a strict grading system (typing Romaji or multiple choice) to test the user's memory and adjust their Learning Progress.
