# brick-mapper
Tool for site-specifically mapping a brick wall pattern.

## Goals
Provide a tool for quickly mapping a pattern of bricks or tiles on a wall, floor or ceiling. Good for when you don’t know the dimensions or exact pattern of your projection site beforehand.

Should be a simple standalone tool that can easily be added into any kind of projected html/js interactive experience.

## Assumptions
This tool assumes the projection has been keystoned to display a unwarped rectangle over the wall's brick pattern.
This tool assumes two things about the pattern you’re overlaying. 1.) Tile size is consistent. 2.) The tiling offset is only row-based, not column-based (97% of brick patterns follow this rule).

## Improvements
- Ability to handle patterns with different sized tiles.
- Ability to knock out rectangular areas for windows and other obstructions.

## Permanence
Since the tool is meant to be used site-specifically, your pattern is only saved to `localStorage`. It will be lost if you clear your cache.