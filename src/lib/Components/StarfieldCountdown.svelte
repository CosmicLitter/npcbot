<script lang="ts">
    let intervalId: number | undefined;

    function countdown() {
        // Set the release time to September 6, 2023, at 00:00:00
        const releaseTime = new Date("September 6, 2023 00:00:00").getTime();

        // Update the count every 1 second
        // @ts-ignore
        intervalId = setInterval(function() {
            // Get the current time
            const now = new Date().getTime();

            // Calculate the remaining time
            const remainingTime = releaseTime - now;

            // Calculate days, hours, minutes, and seconds
            const days = Math.floor(remainingTime / (1000 * 60 * 60 * 24));
            const hours = Math.floor((remainingTime % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((remainingTime % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((remainingTime % (1000 * 60)) / 1000);

            // Update the countdown variable
            const countdownString = "Days: " + days + ", Hours: " + hours + ", Minutes: " + minutes + ", Seconds: " + seconds;

            // Update the HTML markup with the countdown variable
            let countdownElement = document.getElementById("countdown");
            if (countdownElement) {
                countdownElement.innerHTML = countdownString;
            }

            // Check if the release date has passed
            if (remainingTime < 0) {
                if (intervalId) {
                    clearInterval(intervalId);
                }
                let countdownElement = document.getElementById("countdown");
                if (countdownElement) {
                    countdownElement.innerHTML = "Starfield has been released!";
                }
            }
        }, 1000);
    }

    // Call the countdown function
    countdown();
</script>

<b><p id="countdown"></p></b>