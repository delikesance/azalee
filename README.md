## Temporary Voice Channel Management
- [x] Creates temporary voice channels when a user interacts with a button (`/setup` command sets up the system).
- [x] Deletes inactive voice channels after 5 minutes of inactivity
- [x] Cancels deletion if a user joins the channel
- [x] Re-schedules deletion when the last user leaves the channel
- [x] Command to make a temporary voice channel private or public
- [x] Command to add/remove specific user to/from a private voice channel

## XP and Leveling System
- [ ] Commands to display user XP and level progression:
   - [ ] `/xp` command to show the current XP and level of a user.
   - [ ] `/leaderboard` command to display a leaderboard of top users by XP.
- [ ] Command to configure XP gain rates or leveling thresholds:
   - [ ] `/set-xp-rate` command to adjust the XP gain rate for activities.
   - [ ] `/set-level-threshold` command to define XP thresholds for each level.
- [ ] Backend logic for XP calculation:
   - [ ] Implement XP gain for user activities (e.g., sending messages, time spent in voice channels).
   - [ ] Ensure XP gain is rate-limited to prevent abuse.
- [ ] Database schema updates:
   - [ ] Add tables or fields to store user XP and level data.
   - [ ] Ensure data persistence and retrieval for XP and levels.
- [ ] Notifications and feedback:
   - [ ] Notify users when they level up.
   - [ ] Provide feedback on XP gain after activities.


## Command Handling
- [x] Supports the `/ping` command to check if the bot is online
- [x] Supports the `/setup` command to configure the temporary voice channel system

## Database Integration
- [x] Uses Prisma to manage and persist data for temporary voice channels
- [x] Deletes database entries for voice channels when they are removed
