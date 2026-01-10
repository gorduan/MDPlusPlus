# Material Icons Syntax Reference

## Basic Syntax

Insert icons using image syntax with the `google:` prefix:

```markdown
![](google:icon-name)
```

**Result:**

![](google:home)

### Examples

```markdown
![](google:home)
![](google:settings)
![](google:search)
![](google:favorite)
```

**Result:**

![](google:home) ![](google:settings) ![](google:search) ![](google:favorite)

---

## Icon Styles

### Filled (Default)

The default style with solid filled icons:

```markdown
![](google:home)
![](google:star)
![](google:check_circle)
```

**Result:**

![](google:home) ![](google:star) ![](google:check_circle)

### Outlined

Use the `outlined` variant for stroke-style icons:

```markdown
![](google:home:outlined)
![](google:star:outlined)
![](google:check_circle:outlined)
```

**Result:**

![](google:home:outlined) ![](google:star:outlined) ![](google:check_circle:outlined)

### Rounded

Rounded corner style:

```markdown
![](google:home:round)
![](google:star:round)
![](google:check_circle:round)
```

**Result:**

![](google:home:round) ![](google:star:round) ![](google:check_circle:round)

### Sharp

Sharp corner style:

```markdown
![](google:home:sharp)
![](google:star:sharp)
![](google:check_circle:sharp)
```

**Result:**

![](google:home:sharp) ![](google:star:sharp) ![](google:check_circle:sharp)

### Two-Tone

Two-color style with fill and stroke:

```markdown
![](google:home:two-tone)
![](google:star:two-tone)
![](google:check_circle:two-tone)
```

**Result:**

![](google:home:two-tone) ![](google:star:two-tone) ![](google:check_circle:two-tone)

---

## Icon Sizes

### Size Modifiers

Add size after style (or directly after icon name):

```markdown
![](google:home:small)          <!-- 18px -->
![](google:home:medium)         <!-- 24px (default) -->
![](google:home:large)          <!-- 36px -->
![](google:home:x-large)        <!-- 48px -->
```

**Result:**

![](google:home:small) ![](google:home:medium) ![](google:home:large) ![](google:home:x-large)

### Combining Style and Size

```markdown
![](google:star:outlined:large)
![](google:settings:round:small)
![](google:favorite:sharp:x-large)
```

**Result:**

![](google:star:outlined:large) ![](google:settings:round:small) ![](google:favorite:sharp:x-large)

---

## Icon Categories

### Action Icons

```markdown
![](google:search)              <!-- Search -->
![](google:home)                <!-- Home -->
![](google:settings)            <!-- Settings -->
![](google:delete)              <!-- Delete -->
![](google:edit)                <!-- Edit -->
![](google:add)                 <!-- Add -->
![](google:remove)              <!-- Remove -->
![](google:check)               <!-- Check -->
![](google:close)               <!-- Close -->
![](google:menu)                <!-- Menu -->
```

**Result:**

![](google:search) ![](google:home) ![](google:settings) ![](google:delete) ![](google:edit) ![](google:add) ![](google:remove) ![](google:check) ![](google:close) ![](google:menu)

```markdown
![](google:more_vert)           <!-- Vertical dots -->
![](google:more_horiz)          <!-- Horizontal dots -->
![](google:refresh)             <!-- Refresh -->
![](google:save)                <!-- Save -->
![](google:print)               <!-- Print -->
![](google:send)                <!-- Send -->
![](google:download)            <!-- Download -->
![](google:upload)              <!-- Upload -->
![](google:share)               <!-- Share -->
![](google:content_copy)        <!-- Copy -->
![](google:content_paste)       <!-- Paste -->
```

**Result:**

![](google:more_vert) ![](google:more_horiz) ![](google:refresh) ![](google:save) ![](google:print) ![](google:send) ![](google:download) ![](google:upload) ![](google:share) ![](google:content_copy) ![](google:content_paste)

### Navigation Icons

```markdown
![](google:arrow_back)          <!-- Back arrow -->
![](google:arrow_forward)       <!-- Forward arrow -->
![](google:arrow_upward)        <!-- Up arrow -->
![](google:arrow_downward)      <!-- Down arrow -->
![](google:chevron_left)        <!-- Left chevron -->
![](google:chevron_right)       <!-- Right chevron -->
![](google:expand_more)         <!-- Expand down -->
![](google:expand_less)         <!-- Expand up -->
![](google:first_page)          <!-- First page -->
![](google:last_page)           <!-- Last page -->
![](google:navigate_before)     <!-- Navigate before -->
![](google:navigate_next)       <!-- Navigate next -->
```

**Result:**

![](google:arrow_back) ![](google:arrow_forward) ![](google:arrow_upward) ![](google:arrow_downward) ![](google:chevron_left) ![](google:chevron_right) ![](google:expand_more) ![](google:expand_less) ![](google:first_page) ![](google:last_page) ![](google:navigate_before) ![](google:navigate_next)

### Status Icons

```markdown
![](google:check_circle)        <!-- Success -->
![](google:error)               <!-- Error -->
![](google:warning)             <!-- Warning -->
![](google:info)                <!-- Info -->
![](google:help)                <!-- Help -->
![](google:cancel)              <!-- Cancel -->
![](google:block)               <!-- Block -->
![](google:done)                <!-- Done -->
![](google:done_all)            <!-- Done all -->
![](google:pending)             <!-- Pending -->
![](google:schedule)            <!-- Schedule -->
```

**Result:**

![](google:check_circle) ![](google:error) ![](google:warning) ![](google:info) ![](google:help) ![](google:cancel) ![](google:block) ![](google:done) ![](google:done_all) ![](google:pending) ![](google:schedule)

### Communication Icons

```markdown
![](google:mail)                <!-- Email -->
![](google:inbox)               <!-- Inbox -->
![](google:send)                <!-- Send -->
![](google:chat)                <!-- Chat -->
![](google:forum)               <!-- Forum -->
![](google:comment)             <!-- Comment -->
![](google:notifications)       <!-- Notifications -->
![](google:phone)               <!-- Phone -->
![](google:call)                <!-- Call -->
![](google:video_call)          <!-- Video call -->
![](google:message)             <!-- Message -->
![](google:contact_mail)        <!-- Contact email -->
![](google:contact_phone)       <!-- Contact phone -->
```

**Result:**

![](google:mail) ![](google:inbox) ![](google:send) ![](google:chat) ![](google:forum) ![](google:comment) ![](google:notifications) ![](google:phone) ![](google:call) ![](google:video_call) ![](google:message) ![](google:contact_mail) ![](google:contact_phone)

### Content Icons

```markdown
![](google:add_circle)          <!-- Add circle -->
![](google:remove_circle)       <!-- Remove circle -->
![](google:flag)                <!-- Flag -->
![](google:link)                <!-- Link -->
![](google:link_off)            <!-- Unlink -->
![](google:filter_list)         <!-- Filter -->
![](google:sort)                <!-- Sort -->
![](google:create)              <!-- Create/edit -->
![](google:report)              <!-- Report -->
![](google:undo)                <!-- Undo -->
![](google:redo)                <!-- Redo -->
![](google:push_pin)            <!-- Pin -->
![](google:bookmark)            <!-- Bookmark -->
![](google:bookmark_border)     <!-- Bookmark outline -->
```

**Result:**

![](google:add_circle) ![](google:remove_circle) ![](google:flag) ![](google:link) ![](google:link_off) ![](google:filter_list) ![](google:sort) ![](google:create) ![](google:report) ![](google:undo) ![](google:redo) ![](google:push_pin) ![](google:bookmark) ![](google:bookmark_border)

### Media Icons

```markdown
![](google:play_arrow)          <!-- Play -->
![](google:pause)               <!-- Pause -->
![](google:stop)                <!-- Stop -->
![](google:skip_previous)       <!-- Previous -->
![](google:skip_next)           <!-- Next -->
![](google:fast_forward)        <!-- Fast forward -->
![](google:fast_rewind)         <!-- Rewind -->
![](google:replay)              <!-- Replay -->
![](google:volume_up)           <!-- Volume up -->
![](google:volume_down)         <!-- Volume down -->
![](google:volume_off)          <!-- Mute -->
![](google:mic)                 <!-- Microphone -->
![](google:mic_off)             <!-- Mic off -->
![](google:image)               <!-- Image -->
![](google:photo_camera)        <!-- Camera -->
![](google:videocam)            <!-- Video camera -->
![](google:movie)               <!-- Movie -->
![](google:music_note)          <!-- Music -->
```

**Result:**

![](google:play_arrow) ![](google:pause) ![](google:stop) ![](google:skip_previous) ![](google:skip_next) ![](google:fast_forward) ![](google:fast_rewind) ![](google:replay) ![](google:volume_up) ![](google:volume_down) ![](google:volume_off) ![](google:mic) ![](google:mic_off) ![](google:image) ![](google:photo_camera) ![](google:videocam) ![](google:movie) ![](google:music_note)

### File Icons

```markdown
![](google:folder)              <!-- Folder -->
![](google:folder_open)         <!-- Open folder -->
![](google:create_new_folder)   <!-- New folder -->
![](google:file_copy)           <!-- Copy file -->
![](google:description)         <!-- Document -->
![](google:attach_file)         <!-- Attachment -->
![](google:cloud)               <!-- Cloud -->
![](google:cloud_upload)        <!-- Cloud upload -->
![](google:cloud_download)      <!-- Cloud download -->
![](google:cloud_done)          <!-- Cloud done -->
```

**Result:**

![](google:folder) ![](google:folder_open) ![](google:create_new_folder) ![](google:file_copy) ![](google:description) ![](google:attach_file) ![](google:cloud) ![](google:cloud_upload) ![](google:cloud_download) ![](google:cloud_done)

### User Icons

```markdown
![](google:person)              <!-- Person -->
![](google:people)              <!-- People -->
![](google:group)               <!-- Group -->
![](google:account_circle)      <!-- Account circle -->
![](google:face)                <!-- Face -->
![](google:person_add)          <!-- Add person -->
![](google:person_remove)       <!-- Remove person -->
![](google:supervisor_account)  <!-- Admin -->
```

**Result:**

![](google:person) ![](google:people) ![](google:group) ![](google:account_circle) ![](google:face) ![](google:person_add) ![](google:person_remove) ![](google:supervisor_account)

### Security Icons

```markdown
![](google:lock)                <!-- Lock -->
![](google:lock_open)           <!-- Unlock -->
![](google:visibility)          <!-- Show -->
![](google:visibility_off)      <!-- Hide -->
![](google:vpn_key)             <!-- Key -->
![](google:security)            <!-- Security -->
![](google:verified_user)       <!-- Verified -->
![](google:shield)              <!-- Shield -->
```

**Result:**

![](google:lock) ![](google:lock_open) ![](google:visibility) ![](google:visibility_off) ![](google:vpn_key) ![](google:security) ![](google:verified_user) ![](google:shield)

### Social Icons

```markdown
![](google:thumb_up)            <!-- Like -->
![](google:thumb_down)          <!-- Dislike -->
![](google:favorite)            <!-- Heart -->
![](google:favorite_border)     <!-- Heart outline -->
![](google:star)                <!-- Star -->
![](google:star_border)         <!-- Star outline -->
![](google:star_half)           <!-- Half star -->
![](google:mood)                <!-- Happy face -->
![](google:mood_bad)            <!-- Sad face -->
```

**Result:**

![](google:thumb_up) ![](google:thumb_down) ![](google:favorite) ![](google:favorite_border) ![](google:star) ![](google:star_border) ![](google:star_half) ![](google:mood) ![](google:mood_bad)

### Development Icons

```markdown
![](google:code)                <!-- Code -->
![](google:terminal)            <!-- Terminal -->
![](google:bug_report)          <!-- Bug -->
![](google:build)               <!-- Build -->
![](google:extension)           <!-- Extension -->
![](google:settings_applications) <!-- App settings -->
![](google:developer_mode)      <!-- Developer mode -->
![](google:integration_instructions) <!-- Integration -->
![](google:api)                 <!-- API -->
![](google:data_object)         <!-- Data object -->
```

**Result:**

![](google:code) ![](google:terminal) ![](google:bug_report) ![](google:build) ![](google:extension) ![](google:settings_applications) ![](google:developer_mode) ![](google:integration_instructions) ![](google:api) ![](google:data_object)

### Editor Icons

```markdown
![](google:format_bold)         <!-- Bold -->
![](google:format_italic)       <!-- Italic -->
![](google:format_underlined)   <!-- Underline -->
![](google:format_strikethrough) <!-- Strikethrough -->
![](google:format_list_bulleted) <!-- Bullet list -->
![](google:format_list_numbered) <!-- Numbered list -->
![](google:format_quote)        <!-- Quote -->
![](google:format_align_left)   <!-- Align left -->
![](google:format_align_center) <!-- Align center -->
![](google:format_align_right)  <!-- Align right -->
![](google:format_indent_increase) <!-- Indent -->
![](google:format_indent_decrease) <!-- Outdent -->
![](google:title)               <!-- Title -->
![](google:text_fields)         <!-- Text -->
```

**Result:**

![](google:format_bold) ![](google:format_italic) ![](google:format_underlined) ![](google:format_strikethrough) ![](google:format_list_bulleted) ![](google:format_list_numbered) ![](google:format_quote) ![](google:format_align_left) ![](google:format_align_center) ![](google:format_align_right) ![](google:format_indent_increase) ![](google:format_indent_decrease) ![](google:title) ![](google:text_fields)

### Misc Icons

```markdown
![](google:lightbulb)           <!-- Lightbulb -->
![](google:emoji_objects)       <!-- Idea -->
![](google:event)               <!-- Event -->
![](google:today)               <!-- Today -->
![](google:alarm)               <!-- Alarm -->
![](google:timer)               <!-- Timer -->
![](google:hourglass_empty)     <!-- Loading -->
![](google:location_on)         <!-- Location -->
![](google:language)            <!-- Language -->
![](google:translate)           <!-- Translate -->
![](google:public)              <!-- Globe -->
![](google:palette)             <!-- Palette -->
![](google:brush)               <!-- Brush -->
```

**Result:**

![](google:lightbulb) ![](google:emoji_objects) ![](google:event) ![](google:today) ![](google:alarm) ![](google:timer) ![](google:hourglass_empty) ![](google:location_on) ![](google:language) ![](google:translate) ![](google:public) ![](google:palette) ![](google:brush)

---

## Inline Usage

Icons can be used inline with text:

```markdown
Click the ![](google:settings) icon to open settings.

Press ![](google:save) to save your document.

The ![](google:warning) icon indicates a warning.
```

**Result:**

Click the ![](google:settings) icon to open settings.

Press ![](google:save) to save your document.

The ![](google:warning) icon indicates a warning.

---

## In Tables

```markdown
| Feature | Status |
|---------|--------|
| Save | ![](google:check_circle) |
| Export | ![](google:check_circle) |
| Print | ![](google:pending) |
| Share | ![](google:close) |
```

**Result:**

| Feature | Status |
|---------|--------|
| Save | ![](google:check_circle) |
| Export | ![](google:check_circle) |
| Print | ![](google:pending) |
| Share | ![](google:close) |

---

## In Lists

```markdown
- ![](google:check) Task completed
- ![](google:schedule) Task pending
- ![](google:close) Task cancelled
```

**Result:**

- ![](google:check) Task completed
- ![](google:schedule) Task pending
- ![](google:close) Task cancelled

---

## Complete Examples

### Feature List

```markdown
## Features

- ![](google:speed:large) **Fast** - Lightning-fast performance
- ![](google:security:large) **Secure** - Enterprise-grade security
- ![](google:devices:large) **Cross-platform** - Works everywhere
- ![](google:support:large) **24/7 Support** - Always available
```

**Result:**

- ![](google:speed:large) **Fast** - Lightning-fast performance
- ![](google:security:large) **Secure** - Enterprise-grade security
- ![](google:devices:large) **Cross-platform** - Works everywhere
- ![](google:support:large) **24/7 Support** - Always available

### Status Dashboard

```markdown
## System Status

| Service | Status |
|---------|--------|
| API | ![](google:check_circle) Online |
| Database | ![](google:check_circle) Online |
| CDN | ![](google:warning) Degraded |
| Auth | ![](google:check_circle) Online |
```

**Result:**

| Service | Status |
|---------|--------|
| API | ![](google:check_circle) Online |
| Database | ![](google:check_circle) Online |
| CDN | ![](google:warning) Degraded |
| Auth | ![](google:check_circle) Online |

### Navigation Menu

```markdown
- ![](google:home) [Home](#)
- ![](google:description) [Documents](#)
- ![](google:image) [Gallery](#)
- ![](google:settings) [Settings](#)
- ![](google:help) [Help](#)
```

**Result:**

- ![](google:home) [Home](#)
- ![](google:description) [Documents](#)
- ![](google:image) [Gallery](#)
- ![](google:settings) [Settings](#)
- ![](google:help) [Help](#)

### Step-by-Step Guide

```markdown
## Getting Started

1. ![](google:download) Download the installer
2. ![](google:launch) Run the setup wizard
3. ![](google:login) Sign in to your account
4. ![](google:check_circle) You're ready to go!
```

**Result:**

1. ![](google:download) Download the installer
2. ![](google:launch) Run the setup wizard
3. ![](google:login) Sign in to your account
4. ![](google:check_circle) You're ready to go!

---

## Searching Icons

To find icons:
1. Visit [Google Fonts Icons](https://fonts.google.com/icons)
2. Search for the concept you need
3. Click an icon to see its name
4. Use that name with `google:` prefix

---

## Best Practices

1. **Use semantic names** - Choose icons that clearly represent the action
2. **Be consistent** - Use the same icon for the same action throughout
3. **Consider accessibility** - Icons should supplement, not replace, text
4. **Match styles** - Use one style variant throughout a document
5. **Size appropriately** - Use larger sizes for headings, smaller for inline
6. **Test rendering** - Ensure icons display correctly in preview
