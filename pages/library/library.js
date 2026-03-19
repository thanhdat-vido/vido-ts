const bookList = document.querySelector(".ereaders-book-grid ul");

let allBooks = []; // Biến toàn cục để lưu danh sách sách
let currentBooks = []; // Biến lưu trữ danh sách sách hiện tại, khởi tạo bằng allBooks
let currentCategory = null; // Biến để lưu trữ category đang chọn
let currentSearch = '';
let displayedCount = 0;
const batchSize = 50;

function fetchBooks(page = 1) {
    loading.classList.remove("hidden");
    dataCount.innerText = "- đang tải...";
    renderBooks([]);
    axios.get("https://api-thuvien.viendong.edu.vn/api/book/getBiblio")
        .then(response => {
            const books = response.data.data;
            allBooks = response.data.data;
            currentBooks = allBooks;
            // renderBooks(books);
            displayedCount = 0;
            loadMoreBooks();
            loading.classList.add("hidden");
            dataCount.innerText = `- Tổng cộng: ${allBooks.length || 0}`;
            afterLoading.classList.remove("hidden");
        })
        .catch(error => {
            console.error("Lỗi khi lấy dữ liệu sách:", error);
            loading.classList.add("hidden");
            dataCount.innerText = '';
        });
}

function loadMoreBooks() {
    const nextBatch = currentBooks.slice(displayedCount, displayedCount + batchSize);
    if (nextBatch.length === 0) return; // Không còn sách để load

    renderBooks(nextBatch, true); // `true` để nối thêm vào danh sách
    displayedCount += nextBatch.length;
}

function renderBooks(books, append = false) {
    const container = document.getElementById("books-container");

    if (!append) {
        container.innerHTML = "";
    }

    setTimeout(() => {
        books.forEach(book => {
            const bookItem = document.createElement("li");
            bookItem.className = "col-md-2 item";
            bookItem.setAttribute('data-category', book.Category);
    
            bookItem.innerHTML = `
            <div title="${book.BookName}">
                <figure>
                    <a href="detail.html?BookId=${book.BookId}"><img src="./images/cover.pngx" alt="${book.BookId}"></a>
                    <figcaption>
                        <a href="#" class="icon ereaders-heart" title="Yêu thích"></a>
                        <a class="icon ereaders-reload read-btn" title="Xem" id="readButton" style="cursor: pointer;"></a>
                    </figcaption>
                </figure>
                <div class="ereaders-book-grid-text overflow-hidden" style="height: 130px;">
                    <div class="d-flex flex-row justify-content-between">
                        <h2 class="text-truncate" title="${book.BookName}">${book.BookName}</h2>
                    </div>
                    <span class="text-muted">${book.Category || ''}</span>
                    <small class="mt-3 d-block text-secondary">${book.PublisherName || ''}</small>
                    ${book.Attachments && book.Attachments.length > 0 ?
                    '<a class="ereaders-simple-btn ereaders-bgcolor mt-2" style="cursor: pointer;">Đọc Sách</a>'
                    :
                    '<a class="ereaders-simple-btn ereaders-disabled mt-2" style="cursor: pointer;">Mượn tại thư viện</a>'
                }
                </div>
            `;

            bookItem.classList.add("hidden-item");
            setTimeout(() => {
                bookItem.classList.remove("hidden-item");
            }, 50);
    
            const readButtonByClass = bookItem.querySelector(".ereaders-simple-btn", ".read-btn");
            const readButtonById = bookItem.querySelector("#readButton");
    
            readButtonByClass.addEventListener("click", (event) => {
                // Kiểm tra nếu `Attachments` có dữ liệu
                if (!book.Attachments || book.Attachments.length === 0) {
                    event.preventDefault(); // Ngăn không mở modal
                    alert("Sách này không có file đính kèm để đọc, hãy mượn ở thư viện.");
                } else {
                    // Gọi hàm để hiển thị PDF trong modal hoặc xử lý mở modal
                    showPdf(book.Attachments[0], book.BookName);
                    $("#modal").modal("show");
                }
            });
    
            readButtonById.addEventListener("click", (event) => {
                // Kiểm tra nếu `Attachments` có dữ liệu
                if (!book.Attachments || book.Attachments.length === 0) {
                    event.preventDefault(); // Ngăn không mở modal
                    alert("Sách này không có file đính kèm để đọc, hãy mượn ở thư viện.");
                } else {
                    // Gọi hàm để hiển thị PDF trong modal hoặc xử lý mở modal
                    showPdf(book.Attachments[0], book.BookName);
                    $("#modal").modal("show");
                }
            });
    
            container.appendChild(bookItem);
        });
    })
}

const loading = document.getElementById("loading");
const afterLoading = document.getElementById("after-loading");

function showPdf(url, name) {
    const pdfContainer = document.getElementById("frame");
    const fileName = document.getElementById("filename")

    pdfContainer.src = url;
    fileName.innerText = name;

}

document.getElementById("dismiss").addEventListener("click", function () {
    $("#modal").modal("hide");
});


const prevButton = document.querySelector(".previous.page-numbers");
const nextButton = document.querySelector(".next.page-numbers");
const pageLinks = document.querySelectorAll(".page-numbers");
const dataCount = document.getElementById("data-count");

let currentPage = 1; // Giả sử hiện tại đang ở trang 1

// Hàm cập nhật trang hiện tại
function updatePage(newPage) {
    currentPage = newPage;
    fetchBooks(currentPage); // Gọi API với trang mới
    updatePageClass(); // Cập nhật lớp CSS cho trang hiện tại
}

// Hàm cập nhật lớp CSS để làm nổi bật trang hiện tại
function updatePageClass() {
    // Xóa lớp "current" khỏi tất cả các trang
    pageLinks.forEach(pageLink => pageLink.classList.remove("current"));

    // Tìm phần tử của trang hiện tại và thêm lớp "current"
    pageLinks.forEach(pageLink => {
        if (parseInt(pageLink.textContent) === currentPage) {
            pageLink.classList.add("current");
        }
    });
}

// Gắn sự kiện click cho các nút "Previous" và "Next"
// prevButton.addEventListener("click", () => {
//     if (currentPage > 1) {
//         updatePage(currentPage - 1); // Giảm trang
//     }
// });

// nextButton.addEventListener("click", () => {
//     updatePage(currentPage + 1); // Tăng trang
// });

// Gắn sự kiện click cho các liên kết trang
// pageLinks.forEach(pageLink => {
//     pageLink.addEventListener("click", (e) => {
//         const pageNumber = parseInt(e.target.textContent);
//         if (!isNaN(pageNumber)) {
//             updatePage(pageNumber); // Chuyển tới trang đã chọn
//         }
//     });
// });

let debounceTimeout;

function handleInputChange(event) {
    const inputValue = event.target.value;

    // Xóa bỏ timeout trước đó (nếu có) để không gọi hàm filter nhiều lần
    clearTimeout(debounceTimeout);

    // Đặt timeout mới
    debounceTimeout = setTimeout(() => {
        filterBySearch(inputValue); // Gọi hàm filter sau 500ms hoặc 1s
    }, 500); // 500ms hoặc đổi thành 1000 để chờ 1 giây
}

const inputElement = document.getElementById('search-input');
inputElement.addEventListener('input', handleInputChange);

function filterBySearch(text) {
    const container = document.getElementById("books-container");
    const existingItems = container.querySelectorAll(".item");
    existingItems.forEach(item => item.classList.add("hidden-item"));
    currentSearch = text; // Cập nhật category hiện tại
    currentBooks = currentSearch === ''
        ? allBooks
        : allBooks.filter(book => book.BookName.toLowerCase().includes(text.toLowerCase())); // Lọc sách theo category
    
    renderBooks(currentBooks.slice(0, 50), false); // Render lại sách theo category đã chọn
}

function filterByCategory(category) {
    const container = document.getElementById("books-container");
    const existingItems = container.querySelectorAll(".item");
    existingItems.forEach(item => item.classList.add("hidden-item"));
    currentCategory = category; // Cập nhật category hiện tại
    currentBooks = category === 'All'
        ? allBooks
        : allBooks.filter(book => book.Category === category); // Lọc sách theo category
    
    displayedBooksCount = 0; // Reset số lượng sách đã hiển thị khi tìm kiếm
    renderBooks(currentBooks.slice(0, 50), false); // Render lại sách theo category đã chọn
}

// Khởi tạo trang đầu tiên khi tải trang\
document.addEventListener("DOMContentLoaded", () => {
    updatePage(currentPage);
});

let isLoading = false; // Kiểm soát trạng thái đang tải

document.addEventListener('scroll', () => {
    const scrollPosition = window.scrollY + window.innerHeight;
    const pageHeight = document.documentElement.scrollHeight;

    // Chỉ tải thêm dữ liệu khi cuộn đến gần hết trang
    if (scrollPosition >= pageHeight - 100 && !isLoading && displayedCount < currentBooks.length) { // Thêm điều kiện để đợi gần hết trang
        isLoading = true; // Ngăn tải nhiều lần

        // Gọi hàm để tải thêm dữ liệu
        loadMoreBooks();

        // Reset trạng thái sau khi tải xong
        setTimeout(() => {
            isLoading = false;
        }, 1000); // Điều chỉnh thời gian nếu cần
    }
});
