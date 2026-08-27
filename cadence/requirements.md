# Requirements

1. The purpose of the application is to allow users to calculate cadence and stride length for a selected race distance and target time.
2. The application should run entirely in the browser.
3. The application will have the following fields:
    1. Race Distance in metres. Defaults to 5000. Editable by the user. Has a reset button to set it back to the default value. When it changes, recalculate the stride length.
    2. Target time in minutes and seconds. Defaults to 20:00. Editable by the user. Has a reset button to set it back to the default. When it changes, recalculate the stride length.
    3. Cadence numeric field. Default 180. Has a reset button. When it changes, recalculate the stride length. Has a reset button to set it back to the default value.
    4. Stride length numeric field. Calculate from race distance, target time, and cadence. String length = race distance / (target time * cadence). E.g. 5000/(20 * 180) = 1.39 metres when rounded to two decimal places. When the user edits this field, recalculate the cadence.

4. Add a "Reset All" button to reset the fields to their default values and then to recalculate the stride length. 
5. Resetting any single field also recalculates the stride length.
6. Use 2 decimal places for the stride length. 
7. Use hours, minutes, and seconds for the race target time. Convert this to decimal seconds internally for use in the stride length calculation.
8. The web page should be well designed, responsive for different devices, attractive, engaging.
9. Include an advice section built from the user input which has the following format, be sure to substiute up to date values as the fields change:

    You want to run [race distance] in a time of [target time] at a cadence of [cadence], which means you need a stride length of [stride length]. If you hit the cadence and stride length you will hit your race target.
    Training Goals:
        1. First get used to running at a cadence of [cadence] - run your intervals at this cadence, and gradually extend the interval distances over your training period.
        2. Once you're used to running at [cadence], start working on reaching a stride length of [stride length], reduce the interval lengths to maintain the cadence and stride length, then gradually extend the interval distances over the training period. Adding hill reps, running up and down, with long, bounding strides, will help you get used to the longer stride length.

    Tip: Enter your current stride length to see what stride length you need, or enter your current stride length to see what cadence you need. Aim for a cadence of around 180, then use training to extend your stride.
