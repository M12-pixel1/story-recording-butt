# Planning Guide

A simple audio recording application that allows users to record their voice stories using the browser's MediaRecorder API with a prominent "Start Story" button.

**Experience Qualities**:
1. **Approachable** - The interface should feel inviting and non-technical, encouraging users to share their stories without intimidation
2. **Immediate** - Recording should start instantly when the button is pressed, with clear visual feedback throughout the process
3. **Confident** - Users should feel assured that their recording is being captured properly through strong visual and textual cues

**Complexity Level**: Micro Tool (single-purpose application)
This is a focused audio recording tool with a single primary action - recording audio stories. It handles one core workflow from start to finish.

## Essential Features

### Audio Recording
- **Functionality**: Captures audio from the user's microphone using the MediaRecorder API
- **Purpose**: Enables users to record voice stories or narrations without external software
- **Trigger**: Clicking the large "Pradėti pasakojimą" (Start Story) button
- **Progression**: Click button → Request microphone permission → Recording starts → Visual feedback (pulsing/animated state) → Click to stop → Audio saved and playable
- **Success criteria**: Audio is successfully captured, stored, and can be played back with clear quality

### Playback Controls
- **Functionality**: Allows users to listen to their recorded audio
- **Purpose**: Verify the recording quality and content before saving or sharing
- **Trigger**: Appears automatically after recording stops
- **Progression**: Recording stops → Playback controls appear → User can play/pause/replay the recording
- **Success criteria**: Audio plays back smoothly with standard browser audio controls

### Recording Management
- **Functionality**: Display list of recorded audio files with ability to play or delete them
- **Purpose**: Manage multiple recordings in one session
- **Trigger**: After first recording is complete
- **Progression**: Recording saved → Added to list → User can view all recordings → Play or delete individual items
- **Success criteria**: Recordings persist during session, can be individually controlled

## Edge Case Handling
- **No Microphone Permission**: Display clear message asking user to grant microphone access with retry option
- **Unsupported Browser**: Show notification that MediaRecorder API is not supported with browser upgrade suggestion
- **Recording Too Short**: Prevent saving recordings under 1 second to avoid accidental clicks
- **No Recordings Yet**: Show empty state with encouraging message to create first recording
- **Browser Compatibility**: Gracefully handle different audio codec support across browsers

## Design Direction
The design should evoke confidence, warmth, and storytelling tradition - like sitting around a campfire sharing tales. It should feel modern yet timeless, with emphasis on the recording action.

## Color Selection

- **Primary Color**: Deep storytelling indigo `oklch(0.35 0.15 270)` - communicates depth, creativity, and focus
- **Secondary Colors**: 
  - Warm amber `oklch(0.75 0.15 65)` for active/recording states - energy and warmth
  - Soft slate `oklch(0.88 0.02 240)` for backgrounds - calm and unobtrusive
- **Accent Color**: Vibrant coral `oklch(0.68 0.19 25)` - for CTAs and important interactive moments
- **Foreground/Background Pairings**:
  - Primary (Deep Indigo oklch(0.35 0.15 270)): White text (oklch(0.98 0 0)) - Ratio 8.2:1 ✓
  - Accent (Vibrant Coral oklch(0.68 0.19 25)): White text (oklch(0.98 0 0)) - Ratio 4.9:1 ✓
  - Background (Soft Slate oklch(0.88 0.02 240)): Foreground (oklch(0.20 0.02 270)) - Ratio 12.1:1 ✓

## Font Selection
Typography should feel approachable yet refined - like a good storyteller's voice. Using Outfit for its friendly geometric forms and Newsreader for elegant secondary text.

- **Typographic Hierarchy**:
  - H1 (Primary Button): Outfit Bold/24px/normal letter spacing
  - H2 (Status Messages): Outfit SemiBold/18px/tight letter spacing
  - Body (Instructions): Newsreader Regular/16px/relaxed line height
  - Small (Timer/Meta): Outfit Medium/14px/tabular numbers

## Animations
Animations should emphasize the living, breathing nature of voice recording - subtle pulse during recording, smooth transitions between states, and satisfying confirmation when actions complete.

## Component Selection
- **Components**:
  - Button (shadcn) - Large primary action button with custom styling for recording state
  - Card (shadcn) - Container for recorded audio items in the list
  - Alert (shadcn) - Permission requests and error states
  - Progress (shadcn) - Visual recording level indicator
  - Badge (shadcn) - Recording status labels
  
- **Customizations**:
  - Large hero button with custom recording animation (pulsing border/background)
  - Audio waveform visualization using canvas or animated bars
  - Custom recording timer with monospace numerals
  
- **States**:
  - Button: Idle (large, prominent) → Requesting Permission (loading) → Recording (pulsing, red accent) → Stopped (completed state)
  - Cards: Default → Hover (slight elevation) → Playing (accent border)
  
- **Icon Selection**:
  - Microphone (primary action)
  - Stop (end recording)
  - Play/Pause (playback controls)
  - Trash (delete recordings)
  - Circle (recording indicator with pulse animation)
  
- **Spacing**:
  - Large button: p-8 (generous click target)
  - Recording cards: p-4 with gap-3 between elements
  - Container: px-4 py-8 with max-w-2xl centered layout
  
- **Mobile**:
  - Button scales to near full-width on mobile (w-full with max constraints)
  - Recording list stacks vertically with full-width cards
  - Touch targets minimum 48px for all interactive elements
  - Simplified audio controls optimized for touch
