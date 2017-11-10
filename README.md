# brick-mapper
Tool for site-specifically mapping a brick wall pattern.

Goals
Provide a tool for quickly mapping a pattern of bricks or tiles on a wall, floor or ceiling. Good for when you don’t know the dimensions or exact pattern of your projection site beforehand.

Should be a simple standalone tool that can easily be added into any kind of projected html/js interactive experience.

Assumptions
This tool assumes the projection has already be keystoned to be parralel with the wall's brick pattern.
This tool assumes two things about the pattern you’re overlaying. 1.) The size of tiles is consistent. 2.) The tiling offset is only row-based, not column-based (99% of brick patterns follow)


Improvements
In the future, this tool could handle patterns that use different sized tiles.
Also, the ability to knock out rectangular areas for when there’s a big window in the middle of the wall you want to map.

Permanence
Since the tool is meant to be used site-specifically, your pattern is only saved to localStorage. It will be lost if you clear your cache.