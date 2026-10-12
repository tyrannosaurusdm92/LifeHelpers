# Professor Onyx DBT assignments

Open `assets/code/onyx.html`. The widget has **Professor Onyx · DBT practice** in its conversation panel. Happy Home has a **DBT practice** control near the bottom-right corner of the room. They display the same assignments for the active user.

When a conversation in the Virtual & Health tab suggests a relevant DBT skill, Onyx assigns the corresponding handout-and-worksheet pairing from the 102 pairings in `json/dbt/pairings.json`. The chat answer also links to the handout and worksheet. In listen-only conversations, or conversations involving immediate self-harm danger, the automatic skill-matcher stays silent. Only new, topic-relevant practice is assigned. The user may turn off automatic suggestions or choose any of the 102 practices manually.

**Read handout** and **Open worksheet** lead to the original HTML DBT pages. Worksheet entry, print, PDF, save and export are left intact. Assignment status is tracked separately from saving a draft. Marking an assignment complete is voluntary. William and Jasper have separate browser-local assignment records and profile-scoped worksheet answers when opened from Onyx. Conversation text is not saved in the assignment record.

If the signed-in profile is unavailable, Onyx asks which of the two users is currently speaking before showing assignments. This local browser selection does not replace secure authentication. Assignment data is stored in this browser and is not synced to the Apps Script backend or encrypted. Browsers or devices do not automatically exchange progress.

Existing Onyx code, artwork, games, Happy Home, and service-worker contribution are retained. The relocated page has `<base href="../../">` to preserve relative resource resolution, and the PWA manifest, notifications, and machine manifests point to `assets/code/onyx.html`.
