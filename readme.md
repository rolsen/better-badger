<p align="center">
  <img alt="Better Badger" src="https://user-images.githubusercontent.com/279439/84101822-1f31c780-a9cc-11ea-82cd-22a9a0a68824.jpeg" width="480">
</p>

<h1 align="center">Better Badger</h1>

<p align="center">Nudge yourself to be more aware, but don't let reminders interrupt you.</p>

<p align="center">An audio reminder desktop application with a system tray. Improve awareness with audio reminders on an interval of multiple minutes or hours.</p>


## Features

- No pop-ups to dismiss
- System tray controls
    - Disable/Enable
    - Temporary disable


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


## Setup

```
git clone git@github.com:rolsen/better-badger.git
cd better-badger
npm install
npm start
```


## Personal Anecdote

I created this app to output essentially ignorable reminders. After staring at the computer for too long caused a bout of dry eyes, I improved my eye health by using an auditory reminder to blink. The original version (using macOS's `say`):

```bash
while [ 1 ]; do say blink; sleep 1200; done
```

But staring at the computer, programming a larger Electron app is also perfectly reasonable, right? I don't see any problem here.
