document.addEventListener('DOMContentLoaded', function () {
    if (document.getElementById('posts-container')) {
        loadPosts();
    } else if (document.getElementById('post-content')) {
        loadPostDetails(); // Load full post content on post.html
    }
});

let allPosts = [];
let currentPage = 1;
const postsPerPage = 6;

// Load posts from JSON
function loadPosts() {
    fetch('posts.json')
        .then(response => response.json())
        .then(data => {
            allPosts = data.posts;
            displayPosts();
        })
        .catch(error => {
            document.getElementById('posts-container').innerHTML = "<p>Error loading posts.</p>";
        });
}

// Display posts with pagination
function displayPosts() {
    const postsContainer = document.getElementById('posts-container');
    postsContainer.innerHTML = '';

    let start = (currentPage - 1) * postsPerPage;
    let end = start + postsPerPage;
    let paginatedPosts = allPosts.slice(start, end);

    paginatedPosts.forEach(post => {
        let postCard = `<div class="post-card">
            <img src="${post.featured_image}" alt="Post Image" loading="lazy">
            <h3>${post.title}</h3>
            <p>${post.excerpt}</p>
            <button onclick="window.location.href='post.html?slug=${post.url_slug}'">Read More</button>
        </div>`;
        postsContainer.innerHTML += postCard;
    });

    document.getElementById('pageNumber').innerText = currentPage;
}

// Pagination controls
document.getElementById('prevPage').addEventListener('click', function () {
    if (currentPage > 1) {
        currentPage--;
        displayPosts();
    }
});

document.getElementById('nextPage').addEventListener('click', function () {
    if (currentPage * postsPerPage < allPosts.length) {
        currentPage++;
        displayPosts();
    }
});

// Filter posts by category
function filterPosts() {
    const category1 = document.getElementById('category1').value;
    const category2 = document.getElementById('category2').value;

    const category2Option = document.getElementById('category2').options[document.getElementById('category2').selectedIndex];
    const websiteLink = category2Option.getAttribute('data-link');

    if (websiteLink) {
        window.location.href = websiteLink;
        return;
    }

    let filteredPosts = allPosts;

    if (category1) {
        filteredPosts = filteredPosts.filter(post => post.category === category1);
    }

    if (category2) {
        filteredPosts = filteredPosts.filter(post => post.tags && post.tags.includes(category2));
    }

    displayFilteredPosts(filteredPosts);
}

// Display filtered posts
function displayFilteredPosts(posts) {
    const postsContainer = document.getElementById('posts-container');
    postsContainer.innerHTML = '';

    if (posts.length === 0) {
        postsContainer.innerHTML = '<p>No posts available.</p>';
        return;
    }

    posts.forEach(post => {
        let postCard = `<div class="post-card">
            <img src="${post.featured_image}" alt="Post Image" loading="lazy">
            <h3>${post.title}</h3>
            <p>${post.excerpt}</p>
            <button onclick="window.location.href='post.html?slug=${post.url_slug}'">Read More</button>
        </div>`;
        postsContainer.innerHTML += postCard;
    });
}

// Load full post on post.html with ads in the right positions
function loadPostDetails() {
    const urlParams = new URLSearchParams(window.location.search);
    const slug = urlParams.get("slug");

    if (!slug) {
        document.getElementById("post-content").innerHTML = "<p>Invalid post request!</p>";
        return;
    }

    fetch("posts.json")
        .then(response => response.json())
        .then(data => {
            const post = data.posts.find(p => p.url_slug === slug);

            if (post) {
                document.getElementById("post-title").textContent = post.title;
                document.getElementById("post-image").src = post.featured_image;
                
                // ✅ Insert ads dynamically
                let contentHtml = post.full_content;
                let paragraphs = contentHtml.split('</p>');

                // Insert first ad after first paragraph
                if (paragraphs.length > 1) {
                    paragraphs.splice(1, 0, `
                        <div class="ad-container">
                            <p>विज्ञापन</p>
                            <div class="ad-box">[Ad Slot 1]</div>
                        </div>
                    `);
                }

                // Insert second ad in the middle of the content
                let midIndex = Math.floor(paragraphs.length / 2);
                if (paragraphs.length > 3) {
                    paragraphs.splice(midIndex, 0, `
                        <div class="ad-container">
                            <p>विज्ञापन</p>
                            <div class="ad-box">[Ad Slot 2]</div>
                        </div>
                    `);
                }

                // Join paragraphs back and insert into post content
                document.getElementById("post-content").innerHTML = paragraphs.join('</p>');

                // ✅ Ad before share buttons
                document.getElementById("post-content").insertAdjacentHTML('beforeend', `
                    <div class="ad-container">
                        <p>विज्ञापन</p>
                        <div class="ad-box">[Ad Slot 3]</div>
                    </div>
                `);
            } else {
                document.getElementById("post-content").innerHTML = "<p>Post not found!</p>";
            }
        })
        .catch(error => {
            console.error("Error loading post:", error);
            document.getElementById("post-content").innerHTML = "<p>Error loading post. Please try again later.</p>";
        });
}