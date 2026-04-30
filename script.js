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
} else if (page.includes("products.html")) {
    currentPageName = "products";
} else if (page.includes("2valves.html")) {
    currentPageName = "valves";
} else if (page.includes("3machines.html")) {
    currentPageName = "machines";
} else if (page.includes("4system.html")) {
    currentPageName = "system";
} else if (page.includes("5innovation.html")) {
    currentPageName = "innovation";
} else if (page.includes("6service.html")) {
    currentPageName = "service";
} else if (page.includes("7camille.html")) {
    currentPageName = "camille";
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
    <div onclick="openModal('${item.name}', '${item.sku}', '${item.categoryTag}', '${item.desc}', '${item.img}')" 
         class="product-card group bg-white rounded-[2rem] shadow-[0_15px_40px_-15px_rgba(0,0,0,0.1)] hover:translate-y-[-8px] transition-all duration-500 flex flex-col h-full overflow-hidden border border-white cursor-pointer">
        
        <div class="h-56 w-full bg-slate-50/50 flex items-center justify-center p-10 m-2 rounded-[1.8rem] self-center" style="width: calc(100% - 1rem);">
            <img src="${item.img}" alt="${item.name}" class="max-h-full object-contain group-hover:scale-110 transition-transform duration-700">
        </div>

        <div class="p-6 flex flex-col flex-grow text-left">
            <h3 class="text-[15px] font-bold text-slate-900 mb-2 line-clamp-2 h-10 leading-snug">
                ${item.name}
            </h3>
            <p class="text-[10px] font-bold text-blue-500/50 uppercase tracking-widest mb-6">
                CODE: ${item.sku || 'N/A'}
            </p>
            
            <div class="mt-auto">
                <button onclick="event.stopPropagation(); addToCart('${item.name}', '${item.img}')" 
                        class="w-full bg-[#1a4066] text-white py-3 rounded-2xl text-[12px] font-semibold hover:bg-orange-500 shadow-lg shadow-blue-900/10 transition-all flex items-center justify-center gap-2">
                    <i class="fa-solid fa-cart-plus text-[10px]"></i> Add to Cart
                </button>
            </div>
        </div>
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
    window.history.pushState({ path: newurl }, '', newurl);

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
        cart.push({
            name: productName,
            img: productImg,
            quantity: 1
        });
    }

    localStorage.setItem('aitCart', JSON.stringify(cart));
    updateCartUI();

    showToast(productName);
}

function showToast(name) {
    const toast = document.getElementById('center-toast');
    const nameText = document.getElementById('toast-product-name');

    if (!toast || !nameText) return;

    nameText.innerText = name;

    toast.classList.remove('opacity-0', 'pointer-events-none');
    toast.firstElementChild.classList.remove('scale-90');
    toast.firstElementChild.classList.add('scale-100');

    setTimeout(() => {
        toast.classList.add('opacity-0', 'pointer-events-none');
        toast.firstElementChild.classList.remove('scale-100');
        toast.firstElementChild.classList.add('scale-90');
    }, 1000);
}

function updateCartUI() {
    const cartItemsDiv = document.getElementById('cart-items');
    const cartCount = document.getElementById('cart-count');
    const cartTotal = document.getElementById('cart-total');

    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

    if (cartCount) cartCount.innerText = totalItems;
    if (cartTotal) cartTotal.innerText = totalItems + " items";

    if (!cartItemsDiv) return;

    if (cart.length === 0) {
        cartItemsDiv.innerHTML = `<p class="text-center text-gray-400 mt-10 text-xs font-bold">Your shopping cart is empty...</p>`;
    } else {
        cartItemsDiv.innerHTML = cart.map((item, index) => `
            <div class="flex items-center gap-3 bg-white p-3 rounded-xl border border-gray-100 shadow-sm mb-2">
                <div class="w-12 h-12 flex-shrink-0 bg-gray-50 rounded-lg overflow-hidden border">
                    <img src="${item.img}" class="w-full h-full object-contain">
                </div>
                <div class="flex-1 min-w-0">
                    <p class="font-bold text-gray-800 text-[11px] truncate">${item.name}</p>
                    <div class="flex items-center gap-2 mt-1">
                        <button onclick="changeQty(${index}, -1)" class="w-5 h-5 bg-gray-100 rounded text-xs hover:bg-gray-200">-</button>
                        <span class="text-xs font-bold">${item.quantity}</span>
                        <button onclick="changeQty(${index}, 1)" class="w-5 h-5 bg-gray-100 rounded text-xs hover:bg-gray-200">+</button>
                    </div>
                </div>
                <button onclick="removeItem(${index})" class="text-gray-300 hover:text-red-500 p-2">
                    <i class="fa-solid fa-trash-can text-xs"></i>
                </button>
            </div>
        `).join('');
    }
}

function changeQty(index, amount) {
    cart[index].quantity += amount;

    if (cart[index].quantity <= 0) {
        cart.splice(index, 1);
    }

    localStorage.setItem('aitCart', JSON.stringify(cart));

    updateCartUI();
}

function removeItem(index) {
    cart.splice(index, 1);

    localStorage.setItem('aitCart', JSON.stringify(cart));

    updateCartUI();
}

//5
function openModal(name, sku, cats, desc, imgSrc) {
    if (document.getElementById('modalTitle')) document.getElementById('modalTitle').innerText = name;
    if (document.getElementById('modalSku')) document.getElementById('modalSku').innerText = "SKU: " + sku;
    if (document.getElementById('modalCats')) document.getElementById('modalCats').innerText = cats;
    if (document.getElementById('modalDesc')) document.getElementById('modalDesc').innerHTML = desc;
    if (document.getElementById('modalImg')) document.getElementById('modalImg').src = imgSrc;

    if (document.getElementById('modalBreadcrumb')) {
        document.getElementById('modalBreadcrumb').innerText = `Home / Products / ${cats}`;
    }

    const modalBtn = document.getElementById('modalAddToCartBtn');
    if (modalBtn) {
        modalBtn.onclick = () => {
            addToCart(name, imgSrc);
            closeModal();
        };
    }

    const modal = document.getElementById('productModal');
    if (modal) {
        modal.classList.remove('hidden');
        modal.classList.add('flex');
    }
    document.body.style.overflow = 'hidden';
}

function closeModal() {
    const modal = document.getElementById('productModal');
    if (modal) {
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
    window.history.pushState({ path: newurl }, '', newurl);

    renderProducts();
}
//6.5
function filterBySub(subName) {
    filteredProducts = products.filter(item => item.subCategory === subName);

    currentPage = 1;

    renderProducts();

    if (document.getElementById('categoryTitle')) {
        document.getElementById('categoryTitle').innerText = subName.toUpperCase();
    }
}

//7
window.onload = function () {
    const urlParams = new URLSearchParams(window.location.search);
    const pageFromUrl = parseInt(urlParams.get('page'));

    currentPage = pageFromUrl || 1;

    loadProducts();
    updateCartUI();

    if (typeof renderMainSidebar === "function") {
        renderMainSidebar();
    }
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
        if (document.getElementById('backBtn')) document.getElementById('backBtn').classList.add('hidden');
        if (document.getElementById('sidebarTitle')) document.getElementById('sidebarTitle').innerText = "หมวดหมู่สินค้า";
    }
    else if (mode === 'transducer') {
        sidebarUl.innerHTML = `
            <li onclick="filterBySub('KINEAX')" class="px-4 py-3 border-b hover:bg-blue-50 cursor-pointer italic">- KINEAX (2)</li>
            <li onclick="filterBySub('SINEAX')" class="px-4 py-3 border-b hover:bg-blue-50 cursor-pointer italic">- SINEAX (3)</li>
        `;
        if (document.getElementById('backBtn')) document.getElementById('backBtn').classList.remove('hidden');
        if (document.getElementById('sidebarTitle')) document.getElementById('sidebarTitle').innerText = "Measurement ";
    }
}

function loadSubCategory(catName) {
    updateSidebar(catName);

    filteredProducts = products.filter(item => item.subCategory === catName);
    renderProducts();

    if (document.getElementById('categoryTitle')) {
        document.getElementById('categoryTitle').innerText = catName.toUpperCase();
    }
}
//10
document.addEventListener('DOMContentLoaded', function () {
    const menuBtn = document.getElementById('mobile-menu-button');
    const mobileMenu = document.getElementById('mobile-menu');

    if (menuBtn && mobileMenu) {
        menuBtn.addEventListener('click', () => {
            mobileMenu.classList.toggle('hidden');

            const icon = menuBtn.querySelector('i');
            icon.classList.toggle('fa-bars');
            icon.classList.toggle('fa-xmark');
        });
    }
});
//10.5
function toggleMobileMenu() {
    const drawer = document.getElementById('mobile-menu-drawer');
    const overlay = document.getElementById('mobile-menu-overlay');

    if (!drawer || !overlay) return;

    const isClosed = drawer.style.right === '-100%' || drawer.style.right === '';

    if (isClosed) {
        drawer.style.right = '0';
        overlay.classList.remove('invisible', 'opacity-0');
        overlay.classList.add('visible', 'opacity-100');
        document.body.style.overflow = 'hidden';
    } else {
        drawer.style.right = '-100%';
        overlay.classList.remove('visible', 'opacity-100');
        overlay.classList.add('invisible', 'opacity-0');
        document.body.style.overflow = 'auto';
    }
}

function toggleAccordion(id) {
    const subMenu = document.getElementById(id);
    const icon = document.getElementById(id + '-icon');

    if (!subMenu) return;

    if (subMenu.classList.contains('hidden')) {
        subMenu.classList.remove('hidden');
        if (icon) icon.style.transform = 'rotate(180deg)';
    } else {
        subMenu.classList.add('hidden');
        if (icon) icon.style.transform = 'rotate(0deg)';
    }
}