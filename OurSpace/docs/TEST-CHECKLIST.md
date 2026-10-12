# Test checklist

- [ ] Open `OurSpace/work-tab.html` from the same deployed LifeHelpers origin.
- [ ] Confirm six top-level tabs appear alphabetically: Coding, Gaming, Household, Idea Help, Image Creation, Writing.
- [ ] Add more than three subtabs under one tab; reload and confirm they persist.
- [ ] Switch between subtabs and confirm each keeps a separate local transcript.
- [ ] Send a normal message and confirm `onyx.chat` replies.
- [ ] Toggle web search off and send another message.
- [ ] Toggle OurSpace files off and send another message.
- [ ] Attach a small text/PDF/image file and confirm parsing occurs before chat.
- [ ] In Image Creation, keep Generate image enabled and confirm the existing image action is used.
- [ ] Turn Generate image off and confirm Image Creation works as a normal chat thread.
- [ ] Rename, export, clear, and delete a subtab.
- [ ] Confirm deleting the last remaining subtab is blocked.
- [ ] Check desktop and narrow/mobile layouts.
- [ ] Confirm keyboard behavior: Enter sends, Shift+Enter creates a line break, Ctrl/Cmd+K opens the subtab drawer on narrow screens.
- [ ] Confirm no `.gs` backend file exists in the ZIP.

- [ ] Opening `work-tab.html` directly from an extracted local folder shows all six top-level tabs: Coding, Gaming, Household, Idea Help, Image Creation, Writing.
- [ ] Switching among all six top-level tabs updates the title, description, subtabs, welcome prompts, and image-generation mode correctly.


## Onyx Work mood window
- [ ] Sidebar portrait is visible without covering the subtab list.
- [ ] A normal short message shows Listening while Onyx receives it.
- [ ] A complex coding/research/project request can show Thinking.
- [ ] Nuanced output can show Thoughtful.
- [ ] Safe joking can show Judgmental.
- [ ] Warm/affirming input or output can show Purring.
- [ ] After 3 minutes with no posted user or Onyx message, portrait becomes Snuggly.
- [ ] After 5 minutes with no posted user or Onyx message, portrait becomes Sleepy.
- [ ] A request still processing does not enter an idle state.
- [ ] Refreshing the page preserves the correct recent/idle timing.


## Happy Home room and Work fullscreen pass 8
- [ ] Confirm X/Z are 8 px lower and R/B 8 px higher in the Happy Home action pad.
- [ ] Confirm quadruped starts by the A/C at about 64 px and moves along the floor while its size changes smoothly.
- [ ] Move quadruped to each couch spot; verify a jump and the loaf, lounge, and sleep poses at about 130 px.
- [ ] Switch to Professor form and sit at the authored couch seat; verify the 450 px drawing and foot alignment.
- [ ] Turn A/C and ceiling fan on/off; verify the demand text and fan animation.
- [ ] Set Onyx to Hungry and verify the aquarium route, jump, catch animation, saved fish collection, and repeat-allowed species selection.
- [ ] Place a double-compartment bowl, pour wet food to the wet side and dry food/treats to the dry side, and verify package counts decrease.
- [ ] Place and activate a fountain; verify ripples stop when it is off.
- [ ] Open Boosters, preview each supplied cat sound, cast/change a local vote, and confirm the tally persists after reload.
- [ ] Change Design palette values, enter Work fullscreen, and verify every panel, button, field, dialog, link, scrollbar, and focus state follows the current grayscale palette.
- [ ] Open Projects & Catalog, close it with the visible control, and verify focus returns to the launcher.
- [ ] Confirm testing build contains one HTML file and GitHub build contains only files under assets/.
