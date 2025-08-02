// src/router/index.jsx
import { HashRouter, Routes, Route } from 'react-router-dom'

import AcessoIndex from '../modules/acesso/AcessoIndex'
import CreateAccount from '../modules/acesso/CreateAccount'
import ShowSeed from '../modules/acesso/ShowSeed'
import ValidarSeed from '../modules/acesso/ValidarSeed'

import Dashboard from '../modules/dashboard/Dashboard'

import FoodHome from '../modules/food/FoodHome'
import FoodClienteHome from '../modules/food/FoodClienteHome'
import EstabelecimentoCadastrar from '../modules/bazari-local/EstabelecimentoCadastrar'


import AdminDashboard from '../modules/admin/AdminDashboard'
import LocalAdminHome from '../modules/admin/local/LocalAdminHome'
import VendorEstablishmentsList from '../modules/admin/local/vendor/VendorEstablishmentsList'
import VendorAddEstablishment from '../modules/admin/local/vendor/VendorAddEstablishment'
import VendorEstablishmentDetails from '../modules/admin/local/vendor/VendorEstablishmentDetails'
import VendorProducts from '../modules/admin/local/vendor/VendorProducts'
import VendorAddProduct from '../modules/admin/local/vendor/VendorAddProduct'
import VendorRemoveProduct from '../modules/admin/local/vendor/VendorRemoveProduct'  
import VendorManageDeliverers from '../modules/admin/local/vendor/VendorManageDeliverers'
import VendorInviteDeliverers from '../modules/admin/local/vendor/VendorInviteDeliverers'
import VendorSalesHistory from '../modules/admin/local/vendor/VendorSalesHistory' 
import VendorSaleDetails from '../modules/admin/local/vendor/VendorSaleDetails'

export default function Router() {
  return (
    <HashRouter>
      <Routes>
      
      	//controle de acesso
        <Route path="/" element={<AcessoIndex />} />
        <Route path="/create-account" element={<CreateAccount />} />
        <Route path="/show-seed" element={<ShowSeed />} />
        <Route path="/validar-seed" element={<ValidarSeed />} />
        
        //dashboard
        <Route path="/dashboard" element={<Dashboard />} />
        
        //modulo food
        <Route path="/food-home" element={<FoodHome />} />
        <Route path="/food/cliente" element={<FoodClienteHome />} />
        <Route path="/estabelecimento-cadastrar" element={<EstabelecimentoCadastrar />} />

        //modulo Admin
        <Route path="/admin-dashboard" element={<AdminDashboard />} />
        <Route path="/admin/local" element={<LocalAdminHome />} />

        <Route path="/admin/local/vendor" element={<VendorEstablishmentsList />} />
        <Route path="/admin/local/vendor/add" element={<VendorAddEstablishment />} />
        <Route path='/admin/local/vendor/establishment/:id' element={<VendorEstablishmentDetails />} />
        <Route path='/admin/local/vendor/establishment/:id/products' element={<VendorProducts />} />
        <Route path='/admin/vendor/establishment/:id/product/add' element={<VendorAddProduct />} />
        <Route path='/admin/vendor/establishment/:id/product/:id/remove' element={<VendorRemoveProduct />} />                     
        <Route path='/admin/local/vendor/establishment/:id/deliverers' element={<VendorManageDeliverers />} />
        <Route path='/admin/local/vendor/establishment/invite-deliverers' element={<VendorInviteDeliverers />} />
        <Route path='/admin/local/vendor/establishment/:id/sales-history' element={<VendorSalesHistory />} />
        <Route path='/admin/local/vendor/sales/details/:id' element={<VendorSaleDetails />} />
        


      </Routes>
    </HashRouter>
  )
}

