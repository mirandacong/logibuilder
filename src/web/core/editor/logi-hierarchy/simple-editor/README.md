# About Editor

## Features

- Attach component portal to overlay
  - send data to suggestion component and update view
  - receive click event from suggestion component

- Click suggestion item on panel will trigger blur event which would make
panel closed, so the editor component can not receive panel click event.

- The caret positon when autocomplete function name like `source()`.

- When blur event occurs, intellisence controller handle first or editor
handle first.
