import { Component } from '@angular/core';
import { Home } from "../home/home";
import { ProductsListPage } from "../products-list/products-list";
import { WishlistPage } from '../../pages/account/wishlist/wishlist';
import { CartPage } from "../cart/cart";
import { Values } from '../../providers/service/values';

Component({
  selector: 'page-tabs',
  templateUrl: 'tabs.html'
}
)

export class TabsPage{
  homePage: Home;
  productListPage: ProductsListPage;
  WishlistPage: WishlistPage;
  CartPage: CartPage;
  Values: Values
}
