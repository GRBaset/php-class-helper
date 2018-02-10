# Change Log
All notable changes to the "php-class-helper" extension will be documented in this file.

## [0.1.4] Rename `PHP Class Helper` to `Class Helper`

### Added
* Separated setting for PHP and TypeScript. 

### Changed
* Changed the name from `PHP Class Helper` to `Class Helper`

## [0.1.10] - JavaScript and TypeScript support
### Added
* PHP Class Helper now supports:
    * PHP
    * JavaScript `(NEW)`
    * TypeScript `(NEW)`

Because `PHP Class Helper` now supports multiple languages, in the future the name will be changed to simply `Class Helper`.

Class helper in JavaScript allows you to add:
* Classes
* Constructor
* Assign properties
* Add methods

JavaScript showcase:

![JavaScript Showcase](https://raw.githubusercontent.com/predragnikolic/php-class-helper/master/resources/gifs/javascriptShowcase.gif)

Class helper in TypeScript allows you to add:
* Classes
* Constructor
* Assign properties
* Public and private methods
* Getters and setters 

TypeScript showcase:

![TypeScript Showcase](https://raw.githubusercontent.com/predragnikolic/php-class-helper/master/resources/gifs/typescriptShowcase.gif)


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