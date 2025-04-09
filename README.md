# Azalee Discord Bot TODO List

This document outlines the features and tasks required to implement the Azalee Discord bot. The bot's primary goal is to provide custom voice channel management, an XP system, and a welcoming system. Below is a detailed breakdown of the tasks:

---

## 1. **Custom Voice Channels**
### Features:
- [ ] **Create Custom Voice Channels**: Allow users to create custom voice channels by clicking a button under an explanation message.
  - [ ] Add a button interaction handler for creating channels.
  - [ ] Generate a temporary voice channel with a unique name.
  - [ ] Send a confirmation message to the user.
  - [ ] **Send Explanation Message**: Add a command to send the explanation message with the button.

- [ ] **Channel Expiration**: Automatically delete channels that are empty for 5 minutes.
  - [ ] Implement a background task to monitor channel activity.
  - [ ] Use a timer to delete channels after 5 minutes of inactivity.

- [ ] **Channel Privacy Settings**: Allow users to configure their channels as private or public.
  - [ ] Add a command or button to toggle privacy settings.
  - [ ] Restrict access to private channels to specific users.

- [ ] **Add Users to Private Channels**: Allow users to add other users to their private channels.
  - [ ] Implement a command to add users to a private channel.
  - [ ] Update channel permissions dynamically.

---

## 2. **XP System**
### Features:
- [ ] **Voice Activity XP**: Award XP to users based on their time spent in voice channels.
  - [ ] Track user activity in voice channels.
  - [ ] Calculate and store XP in the database.

- [ ] **Message Activity XP**: Award XP to users based on their messages in text channels.
  - [ ] Monitor message events and calculate XP.
  - [ ] Prevent abuse by adding a cooldown or rate limit.

- [ ] **XP Leaderboard**: Display a leaderboard of users with the highest XP.
  - [ ] Create a command to display the leaderboard.
  - [ ] Fetch and sort XP data from the database.

- [ ] **Level-Up Notifications**: Notify users when they level up.
  - [ ] Calculate levels based on XP thresholds.
  - [ ] Send a congratulatory message when a user levels up.

---

## 3. **Welcoming System**
### Features:
- [x] **Welcome Messages**: Send a welcome message to new members.
  - [x] Allow server admins to configure the welcome message.
  - [x] Support placeholders for dynamic content (e.g., username, server name).

- [x] **Welcome Channel Configuration**: Allow admins to set a specific channel for welcome messages.
  - [x] Add a command to configure the welcome channel.
  - [x] Store the configuration in the database.

---

## 4. **Additional Features**
### Features:
- [ ] **Command Help System**: Provide a help command to list all available commands and their descriptions.
  - [ ] Dynamically generate help content based on registered commands.

- [ ] **Error Handling**: Improve error handling for commands and interactions.
  - [ ] Log errors to the console or a log file.
  - [ ] Provide user-friendly error messages.

- [ ] **Localization**: Support multiple languages for bot messages.
  - [ ] Create a system for managing translations.
  - [ ] Allow server admins to set the bot's language.

- [x] **Admin Commands**: Add commands for server admins to manage the bot.
  - [x] Commands to reload configurations without restarting the bot.
  - [x] Commands to view bot status and statistics.
  - [x] Commands to set configuration values dynamically.

---

## 5. **Technical Tasks**
### Tasks:
- [ ] **Database Schema**: Update the database schema to support new features.
  - [ ] Add tables for tracking XP, custom channels, and configurations.

- [ ] **Event Handlers**: Implement event handlers for voice state updates, message events, and button interactions.

- [ ] **Testing**: Write unit tests and integration tests for all features.
  - [ ] Test command execution and error handling.
  - [ ] Test database interactions.

- [ ] **Documentation**: Document all commands, features, and configuration options.
  - [ ] Update the README with usage instructions.
  - [ ] Provide examples for common use cases.

---

## 6. **Stretch Goals**
### Features:
- [ ] **Custom Roles**: Allow users to unlock custom roles based on their XP or achievements.
- [ ] **Channel Templates**: Allow users to save and reuse channel settings as templates.
- [ ] **Event Scheduling**: Add a feature for scheduling events in voice channels.
- [ ] **Bot Dashboard**: Create a web dashboard for managing the bot's settings and viewing statistics.

---

This TODO list provides a comprehensive roadmap for implementing the Azalee Discord bot. Developers should follow this list to ensure all features are implemented correctly and efficiently.
