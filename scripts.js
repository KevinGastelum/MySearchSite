;(function () {
  // Initialize Adzuna and application ID
  const isnull = 'e00527af1252728ba336e432a47b3219' // Replace
  const adzunaAppID = '2218b6bd'

  // Wait for DOM content to load before executing the script
  document.addEventListener('DOMContentLoaded', function () {
    // Fetch job data from Adzuna
    fetchJobDataFromAdzuna()

    // Get search box and location filter elements
    const searchBox = document.getElementById('search-box')
    const locationFilter = document.getElementById('location-filter')

    // Add event listeners to search box and location filter to update jobs when filters change
    searchBox.addEventListener('input', () => {
      filterJobs(currentJobs)
    })
    locationFilter.addEventListener('change', () => {
      filterJobs(currentJobs)
    })

    // Initialize an array to store the current job data
    let currentJobs = []

    // Function to populate the location filter dropdown with unique locations from the job data
    function populateLocationFilter(jobs) {
      // Get unique locations from job data
      const uniqueLocations = Array.from(
        new Set(jobs.map((job) => job.location))
      ).sort()

      // Add each unique location as an option in the location filter dropdown
      uniqueLocations.forEach((location) => {
        const option = document.createElement('option')
        option.value = location
        option.textContent = location
        locationFilter.appendChild(option)
      })
    }

    // Function to truncate job description text to a maximum length
    function truncateDescription(text, maxLength = 100) {
      if (text.length <= maxLength) {
        return text
      }
      return `${text.substring(0, maxLength)}...`
    }

    // Function to update the featured jobs section with the provided job data
    function updateFeaturedJobs(jobs) {
      const featuredJobsSection = document.getElementById('featured-jobs')

      let html = ''

      // Generate HTML for each job
      jobs.forEach((job) => {
        html += `
          <div class="job">
            <h3>${job.title}</h3>
            <h4>${job.company}</h4>
            <p class="location">${job.location}</p>
            <p class="description" data-full-description="${job.description}">
              ${truncateDescription(job.description)}
            </p>
            <button class="show-more-btn">Show More</button>
            <a href="${job.url}" class="apply-now-btn">Apply Now</a>
          </div>
        `
      })

      // Update the featured jobs section with the generated HTML
      featuredJobsSection.innerHTML = html

      // Add event listeners for the "Show More" buttons to toggle between truncated and full job descriptions
      document.querySelectorAll('.show-more-btn').forEach((button) => {
        button.addEventListener('click', () => {
          const descriptionElement = button.previousElementSibling
          const fullDescription = descriptionElement.dataset.fullDescription
          const isTruncated = descriptionElement.textContent.endsWith('...')

          if (isTruncated) {
            descriptionElement.textContent = fullDescription
            button.textContent = 'Show Less'
          } else {
            descriptionElement.textContent =
              truncateDescription(fullDescription)
            button.textContent = 'Show More'
          }
        })
      })
    }

    // Function to check if a job matches the provided keyword
    function keywordFilter(job, keyword) {
      return (
        job.title.toLowerCase().includes(keyword.toLowerCase()) ||
        job.company.toLowerCase().includes(keyword.toLowerCase()) ||
        job.description.toLowerCase().includes(keyword.toLowerCase())
      )
    }

    // Function to filter jobs based on search box and location filter values
    function filterJobs(jobs) {
      const keyword = searchBox.value
      const location = locationFilter.value
      const filteredJobs = jobs.filter((job) => {
        const keywordMatch = keyword === '' || keywordFilter(job, keyword)
        const locationMatch = location === 'all' || job.location === location
        return keywordMatch && locationMatch
      })

      // Update the featured jobs section with the filtered job data
      updateFeaturedJobs(filteredJobs)
    }

    // Add event listener to location filter to update jobs when the selected location changes
    locationFilter.addEventListener('change', filterJobs)

    // Function to fetch job data from the Adzuna API
    async function fetchJobDataFromAdzuna() {
      // API request URL with parameters for the number of results, location, and job type
      const apiUrl = `https://api.adzuna.com/v1/api/jobs/us/search/1?app_id=${adzunaAppID}&app_key=${isnull}&results_per_page=50&where=Phoenix,%20AZ&what=data%20analyst&content-type=application/json`

      try {
        // Fetch job data from the API
        const response = await fetch(apiUrl)
        const data = await response.json()

        // Map the fetched data to a more convenient job object format
        const jobs = data.results.map((job) => {
          return {
            id: job.id,
            title: job.title,
            company: job.company.display_name,
            location: `${job.location.area[2]}, ${job.location.area[1]}`,
            description: job.description,
            url: job.redirect_url,
          }
        })

        // Update the current job data and update the featured jobs section and location filter dropdown
        currentJobs = jobs
        updateFeaturedJobs(jobs)
        populateLocationFilter(jobs)
      } catch (error) {
        console.error('Error fetching job data:', error)
      }
    }
  })
})()
