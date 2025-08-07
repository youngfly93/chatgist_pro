# Simple Single-cell Plumber API starter
cat("Starting Single-cell Plumber API...\n")
source("singlecell_plumber_api.R")

# Start the API
pr <- plumb("singlecell_plumber_api.R")
pr$run(host = "0.0.0.0", port = 8003)