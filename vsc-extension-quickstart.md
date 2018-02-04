# PHP Class Helper

## Looking for a php companion? PHP Class Helper is the extension for you.

What does PHP Class Companion do? 
* Add a class snippet if the cursor is out of the scope of another class.

![Add Class](/php-class-helper/class.gif)

* Add a constructor if the cursor is in scope of a class and there is no other constructor.

![Add Constructor](/php-class-helper/constructor.gif)

* Add properties if the cursor is in scope of a class and  if the class has a constructor

![Add Properties](/home/predrag/git/php-class-helper/addVariables.gif)

## How do you do all of that?
The default keybinding is `ctrl+shift+c`, but you are free to change it however you like. This simple keybinding is all you need to add a class, constructor and properties.

## Settings

In settings you can tweak the visibility of a property:

`php-class-helper.visibility: "private"`

## Known issues

Needs a couple of second to start to work correctly.

## Idea

This extension is inspired by sublime [php companion](https://github.com/erichard/SublimePHPCompanion) package.