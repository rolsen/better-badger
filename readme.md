# Better Badger

Nudge yourself to be more aware, but don't let reminders interrupt you.

An audio reminder desktop application with a system tray. Improve awareness with audio reminders on an interval of multiple minutes or hours.


## Examples

Excuse me, but plz don't forget to:
 - Drink water
 - Appreciate the little things
 - Eat something
 - Smile
 - Blink
 - Focus
 - Stand up every now and then
 - Remember your goals
 - Practice awareness


## Requirements

macOS-only.


## Features

- No pop-ups to dismiss
- System tray controls
    - Disable/Enable
    - Temporary disable


## Personal Anecdote

I created this app to output essentially ignorable reminders. After staring at the computer for too long caused a bout of dry eyes, I improved my eye health by using an auditory reminder to blink. The original version (using macOS's `say`):

```bash
while [ 1 ]; do say blink; sleep 1200; done
```

But staring at the computer, programming a larger Electron app is also perfectly reasonable, right? I don't see any problem here.
