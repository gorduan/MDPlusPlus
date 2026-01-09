# Material Icons Syntax Reference

## Basic Syntax

Insert icons using image syntax with the `google:` prefix:

```markdown
![](google:icon-name)
```

### Examples

```markdown
![](google:home)
![](google:settings)
![](google:search)
![](google:favorite)
```

---

## Icon Styles

### Filled (Default)

The default style with solid filled icons:

```markdown
![](google:home)
![](google:star)
![](google:check_circle)
```

### Outlined

Use the `outlined` variant for stroke-style icons:

```markdown
![](google:home:outlined)
![](google:star:outlined)
![](google:check_circle:outlined)
```

### Rounded

Rounded corner style:

```markdown
![](google:home:round)
![](google:star:round)
![](google:check_circle:round)
```

### Sharp

Sharp corner style:

```markdown
![](google:home:sharp)
![](google:star:sharp)
![](google:check_circle:sharp)
```

### Two-Tone

Two-color style with fill and stroke:

```markdown
![](google:home:two-tone)
![](google:star:two-tone)
![](google:check_circle:two-tone)
```

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

### Combining Style and Size

```markdown
![](google:star:outlined:large)
![](google:settings:round:small)
![](google:favorite:sharp:x-large)
```

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

---

## Inline Usage

Icons can be used inline with text:

```markdown
Click the ![](google:settings) icon to open settings.

Press ![](google:save) to save your document.

The ![](google:warning) icon indicates a warning.
```

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

---

## In Lists

```markdown
- ![](google:check) Task completed
- ![](google:schedule) Task pending
- ![](google:close) Task cancelled
```

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

### Navigation Menu

```markdown
- ![](google:home) [Home](#)
- ![](google:description) [Documents](#)
- ![](google:image) [Gallery](#)
- ![](google:settings) [Settings](#)
- ![](google:help) [Help](#)
```

### Step-by-Step Guide

```markdown
## Getting Started

1. ![](google:download) Download the installer
2. ![](google:launch) Run the setup wizard
3. ![](google:login) Sign in to your account
4. ![](google:check_circle) You're ready to go!
```

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
