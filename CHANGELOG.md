# Change Log
All notable changes to the "php-class-helper" extension will be documented in this file.

## [0.0.10]
### Changed
* Not much has changed, exept a huge refactor of the whole code. Expect some surprising things in the future ;) 

## [0.0.9]
### Added
* Add getters and setters.
    * Getters and setters are placed after a constructor if the constructor exist, if not, they are placed after the last propery. 
    * If the class has a missing getter or setter for a property, then the missing getter or setter will be added. 
    * If the class has a getter and a setter for a property, nothing will be added. 

![Add Getters And Setters](https://raw.githubusercontent.com/predragnikolic/php-class-helper/master/resources/gifs/addGetterAndSetter.gif)

## [0.0.6]
### Added
- Functionality to add public and private methods. Public methods are always placed before the first private method.
    * The keybinding to add a public method is `alt+m`.
    * The keybinding to add a private method is `ctrl+alt+m`.

### Changed
- The default keybinding to add a class, constructor and properties is now changed from `ctrl+alt+c` to simply `alt+c`.

## [0.0.1]
- Initial release