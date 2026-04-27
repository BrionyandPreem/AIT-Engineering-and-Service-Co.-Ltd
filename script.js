let products = []; 
let filteredProducts = [];
let currentPage = 1;      
const itemsPerPage = 20;  
//1
const path = window.location.pathname;
const page = path.split("/").pop(); 

let currentPageName = "";

if (page.includes("1measurement.html") || page === "index.html") {
    currentPageName = "measurement";
} else if (page.includes("2valves.html")) {
    currentPageName = "valves";
}

async function loadProducts() {
    try {
        const response = await fetch('products.json');
        const allProducts = await response.json();
        
        products = allProducts.filter(item => item.page === currentPageName);
        
        filteredProducts = [...products]; 
        console.log(`Success: ${currentPageName} items loaded:`, products);
        
        renderProducts(); 
    } catch (error) {
        console.error("Failed to load data:", error);
    }
}
//2
let cart = JSON.parse(localStorage.getItem('aitCart')) || [];
//3
function renderProducts() {
    const grid = document.getElementById('productGrid');
    if (!grid) return; 
    grid.innerHTML = "";

    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    const paginatedItems = filteredProducts.slice(start, end);

    // ส่วนนับเลขสินค้าอัตโนมัติ
    const totalCount = filteredProducts.length;
    const showingCount = Math.min(end, totalCount); 
    const showingStart = totalCount === 0 ? 0 : start + 1;

    const currentElement = document.getElementById('current-showing');
    const totalElement = document.getElementById('total-products');
    
    if (currentElement) currentElement.innerText = `${showingStart}-${showingCount}`;
    if (totalElement) totalElement.innerText = totalCount;

    if (paginatedItems.length === 0) {
        grid.innerHTML = `<p class="col-span-full text-center text-gray-400 py-20">No products found in this category</p>`;
    }

    paginatedItems.forEach(item => {
        const card = `
            <div class="product-card group text-center flex flex-col items-center" data-category="${item.categoryTag}">
                <div class="h-40 w-full bg-gray-50 mb-4 flex items-center justify-center p-4 overflow-hidden">
                    <img src="${item.img}" alt="${item.name}" class="max-h-full group-hover:scale-110 transition duration-300">
                </div>
                <h3 onclick="openModal('${item.name}', '${item.sku}', '${item.category}', '${item.desc}', '${item.img}')" 
                    class="text-sm font-medium text-gray-800 mb-1 cursor-pointer hover:text-blue-600 transition">
                    ${item.name}
                </h3>
                <p onclick="openModal('${item.name}', '${item.sku}', '${item.category}', '${item.desc}', '${item.img}')" 
                    class="text-blue-400 text-xs mb-4 cursor-pointer hover:underline">
                    Read more
                </p>
                <button onclick="addToCart('${item.name}', '${item.img}')" class="bg-orange-500 text-white px-4 py-1.5 text-[11px] rounded font-bold shadow-sm hover:bg-orange-600 transition">
                    <i class="fa-solid fa-plus mr-1"></i> Add to Cart
                </button>
            </div>
        `;
        grid.innerHTML += card;
    });

    renderPagination();
}

function renderPagination() {
    const paginationDiv = document.getElementById('pagination-controls');
    if (!paginationDiv) return;
    
    const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
    let paginationHtml = "";

    if (totalPages > 1) {
        for (let i = 1; i <= totalPages; i++) {
            paginationHtml += `
                <button onclick="changePage(${i})" 
                    class="px-4 py-2 mx-1 rounded border ${currentPage === i ? 'bg-green-600 text-white' : 'bg-white text-gray-600 hover:bg-green-50'}">
                    ${i}
                </button>
            `;
        }
    }
    paginationDiv.innerHTML = paginationHtml;
}

function changePage(page) {
    currentPage = page;
    
    const newurl = window.location.protocol + "//" + window.location.host + window.location.pathname + '?page=' + page;
    window.history.pushState({path:newurl}, '', newurl);
    
    renderProducts();
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

//4
function toggleCart() {
    const drawer = document.getElementById('cart-drawer');
    const overlay = document.getElementById('cart-overlay');
    if (drawer && overlay) {
        drawer.classList.toggle('translate-x-full');
        overlay.classList.toggle('hidden');
    }
}

function addToCart(productName, productImg) {
    const existingItem = cart.find(item => item.name === productName);
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({ name: productName, img: productImg, quantity: 1 });
    }
    updateCartUI();
}

function updateCartUI() {
    const cartItemsDiv = document.getElementById('cart-items');
    const cartCount = document.getElementById('cart-count');
    const cartTotal = document.getElementById('cart-total');
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    if(cartCount) cartCount.innerText = totalItems;
    if(cartTotal) cartTotal.innerText = totalItems + " items";

    if (cart.length === 0) {
        cartItemsDiv.innerHTML = `<p class="text-center text-gray-400 mt-10">Your shopping cart is empty...</p>`;
    } else {
        cartItemsDiv.innerHTML = cart.map((item, index) => `
            <div class="flex items-center gap-3 bg-white p-3 rounded-xl border border-gray-100 shadow-sm">
                <div class="w-12 h-12 flex-shrink-0 bg-gray-50 rounded-lg overflow-hidden border">
                    <img src="${item.img}" class="w-full h-full object-contain">
                </div>
                <div class="flex-1 min-w-0">
                    <p class="font-bold text-gray-800 text-[11px] truncate">${item.name}</p>
                    <div class="flex items-center gap-2 mt-1">
                        <button onclick="changeQty(${index}, -1)" class="w-5 h-5 bg-gray-100 rounded text-xs">-</button>
                        <span class="text-xs font-bold">${item.quantity}</span>
                        <button onclick="changeQty(${index}, 1)" class="w-5 h-5 bg-gray-100 rounded text-xs">+</button>
                    </div>
                </div>
                <button onclick="removeItem(${index})" class="text-gray-300 hover:text-red-500 p-2">
                    <i class="fa-solid fa-trash-can text-xs"></i>
                </button>
            </div>
        `).join('');
    }
    localStorage.setItem('aitCart', JSON.stringify(cart));
}

function changeQty(index, amount) {
    cart[index].quantity += amount;
    if (cart[index].quantity <= 0) cart.splice(index, 1);
    updateCartUI();
}

function removeItem(index) {
    cart.splice(index, 1);
    updateCartUI();
}

//5
function openModal(name, sku, cats, desc, imgSrc) {
    if(document.getElementById('modalTitle')) document.getElementById('modalTitle').innerText = name;
    if(document.getElementById('modalSku')) document.getElementById('modalSku').innerText = "SKU: " + sku;
    if(document.getElementById('modalCats')) document.getElementById('modalCats').innerText = cats;
    if(document.getElementById('modalDesc')) document.getElementById('modalDesc').innerHTML = desc;
    if(document.getElementById('modalImg')) document.getElementById('modalImg').src = imgSrc;
    
    if(document.getElementById('modalBreadcrumb')) {
        document.getElementById('modalBreadcrumb').innerText = `Home / Products / ${cats}`;
    }

    const modalBtn = document.getElementById('modalAddToCartBtn');
    if(modalBtn) {
        modalBtn.onclick = () => {
            addToCart(name, imgSrc);
            closeModal();
        };
    }

    const modal = document.getElementById('productModal');
    if(modal) {
        modal.classList.remove('hidden');
        modal.classList.add('flex');
    }
    document.body.style.overflow = 'hidden';
}

function closeModal() {
    const modal = document.getElementById('productModal');
    if(modal) {
        modal.classList.add('hidden');
        modal.classList.remove('flex');
    }
    document.body.style.overflow = 'auto';
}

//6
function filterByCategory(categoryName) {
    const searchCat = categoryName.toLowerCase().trim();
    
    if (searchCat === 'all' || searchCat === 'all categories') {
        filteredProducts = [...products];
    } else {
        filteredProducts = products.filter(item => {
            const tags = String(item.categoryTag).toLowerCase();
            return tags.includes(searchCat);
        });
    }
    
    currentPage = 1;
    const newurl = window.location.protocol + "//" + window.location.host + window.location.pathname;
    window.history.pushState({path:newurl}, '', newurl);
    
    renderProducts();
}
//6.5
function filterBySub(subName) {
    filteredProducts = products.filter(item => item.subCategory === subName);

    currentPage = 1;

    renderProducts();

    if(document.getElementById('categoryTitle')) {
        document.getElementById('categoryTitle').innerText = subName.toUpperCase();
    }
}

//7
window.onload = function() {
    const urlParams = new URLSearchParams(window.location.search);
    const pageFromUrl = parseInt(urlParams.get('page'));
    
    if (pageFromUrl) {
        currentPage = pageFromUrl;
    } else {
        currentPage = 1;
    }

    loadProducts(); 
    updateCartUI(); 
};
//8
function searchProducts() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase().trim();

    filteredProducts = products.filter(item => {
        const nameMatch = item.name.toLowerCase().includes(searchTerm);
        const skuMatch = item.sku ? item.sku.toLowerCase().includes(searchTerm) : false;
        
        return nameMatch || skuMatch;
    });

    currentPage = 1;

    renderProducts();
}

function searchSidebarProducts() {
    const searchTerm = document.getElementById('sidebarSearchInput').value.toLowerCase().trim();

    filteredProducts = products.filter(item => {
        const nameMatch = item.name.toLowerCase().includes(searchTerm);
        const skuMatch = item.sku ? item.sku.toLowerCase().includes(searchTerm) : false;
        return nameMatch || skuMatch;
    });

    currentPage = 1;
    renderProducts();
}
//9
function updateSidebar(mode) {
    const sidebarUl = document.getElementById('sidebarMenu');
    if (!sidebarUl) return;
    
    if (mode === 'main') {
        sidebarUl.innerHTML = `
            <li onclick="loadSubCategory('pressure')" class="px-4 py-3 border-b hover:bg-blue-50 cursor-pointer flex justify-between">
                Pressure and Level <span>(15)</span>
            </li>
            <li onclick="loadSubCategory('transducer')" class="px-4 py-3 border-b hover:bg-blue-50 cursor-pointer flex justify-between">
                Transducers, Converters... <span>(19)</span>
            </li>
            `;
        if(document.getElementById('backBtn')) document.getElementById('backBtn').classList.add('hidden');
        if(document.getElementById('sidebarTitle')) document.getElementById('sidebarTitle').innerText = "หมวดหมู่สินค้า";
    } 
    else if (mode === 'transducer') {
        sidebarUl.innerHTML = `
            <li onclick="filterBySub('KINEAX')" class="px-4 py-3 border-b hover:bg-blue-50 cursor-pointer italic">- KINEAX (2)</li>
            <li onclick="filterBySub('SINEAX')" class="px-4 py-3 border-b hover:bg-blue-50 cursor-pointer italic">- SINEAX (3)</li>
        `;
        if(document.getElementById('backBtn')) document.getElementById('backBtn').classList.remove('hidden');
        if(document.getElementById('sidebarTitle')) document.getElementById('sidebarTitle').innerText = "Measurement ";
    }
}

function loadSubCategory(catName) {
    updateSidebar(catName);
    
    filteredProducts = products.filter(item => item.subCategory === catName); 
    renderProducts();
    
    if(document.getElementById('categoryTitle')) {
        document.getElementById('categoryTitle').innerText = catName.toUpperCase();
    }
}