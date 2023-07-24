#!/bin/sh
# gradle --version
# gradle build --continuous -PskipDownload=true --console=plain &
# gradle bootRun -PskipDownload=true --console=plain --continuous

# buildAndReload task, running in background, watches for source changes
(sleep 60; gradle buildAndReload --continuous -PskipDownload=true -x Test)&
gradle bootRun -PskipDownload=true -Dspring.profiles.active=development
