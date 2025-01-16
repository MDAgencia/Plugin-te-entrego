<?php
/*
Plugin Name: te-entrego-plugin
Plugin URI: https://example.com
Description: A simple WordPress plugin that adds a settings menu.
Version: 1.0.0
Author: Tu Nombre
Author URI: https://example.com
*/

// Registra la opción y crea el menú
function mi_plugin_settings_init() {
    register_setting( 'mi_plugin', 'mi_plugin_options' );
}

add_action( 'admin_init', 'mi_plugin_settings_init' );

function mi_plugin_options_page() {
    ?>
    <div id="root"></div>
    <?php
}

function mi_plugin_options_page_setup() {
    add_menu_page(
        'Configuraciones de Te Entrego plugin',
        'Te entrego',
        'manage_options',
        'mi_plugin',
        'mi_plugin_options_page'
    );
}

add_action( 'admin_menu', 'mi_plugin_options_page_setup' );

function mi_plugin_enqueue_scripts($hook) {
    if ($hook !== 'toplevel_page_mi_plugin') {
        return;
    }

    wp_enqueue_style('my-plugin-style', plugin_dir_url(__FILE__) . 'dist/assets/styles.css');
    wp_enqueue_script(
        'mi-plugin-script',
        plugin_dir_url(__FILE__) . 'dist/assets/build.js',
        array(),
        null,
        true
    );
}

add_action('admin_enqueue_scripts', 'mi_plugin_enqueue_scripts');

// Registrar un endpoint personalizado en la API REST de WordPress para devolver órdenes en formato WooCommerce
function registrar_endpoint_ordenes_wc() {
    register_rest_route( 'woo/v1', '/orders/', [
        'methods' => 'GET',
        'callback' => 'obtener_ordenes_formato_wc',
        'permission_callback' => '__return_true', // Permitir acceso sin permisos
    ]);
}

add_action( 'rest_api_init', 'registrar_endpoint_ordenes_wc' );



function obtener_ordenes_formato_wc( $request ) {
    $estado = $request->get_param('estado') ?? 'any';
     
     // Define los estados permitidos explícitamente, excluyendo 'refunded' y 'completed'
     $estados_permitidos = ['pending', 'processing', 'on-hold', 'failed', 'cancelled', 'trashed'];
     
     // Si el parámetro 'estado' es diferente de 'any', lo añadimos al filtro
     if ($estado !== 'any') {
         // Si el estado solicitado está en los permitidos, añadirlo al array
         if (in_array($estado, $estados_permitidos)) {
             $args['status'] = $estado;
         }
     } else {
         $args['status'] = $estados_permitidos;
     }

     // Obtener las órdenes usando los estados filtrados
     $ordenes = wc_get_orders( $args );
    $products = [];
    $resultado = [];
 
    
    foreach ( $ordenes as $orden ) {
        // Asegurarse de que el objeto es una instancia de WC_Order
        if ( ! is_a( $orden, 'WC_Order' ) ) {
            continue;
        }

        
         foreach ($orden->get_items() as $item) {
             $product = $item->get_product();
             if ($product) {
                 $products[] = [
                     'name' => $product->get_name(),
                     'weight' => $product->get_weight(),
                     'width' => $product->get_width(),
                     'height' => $product->get_height(),
                     'length' => $product->get_length(),
                 ];
             }
         }

        $resultado[] = [
        'products' => $products,
            'id' => $orden->get_id(),
            'parent_id' => $orden->get_parent_id(),
            'status' => $orden->get_status(),
            'currency' => $orden->get_currency(),
            'total' => $orden->get_total(),
            'subtotal' => $orden->get_subtotal(),
            'date_created' => $orden->get_date_created()->date('Y-m-d\TH:i:s'),
            'date_modified' => $orden->get_date_modified()->date('Y-m-d\TH:i:s'),
            'billing' => [
                'first_name' => $orden->get_billing_first_name(),
                'last_name' => $orden->get_billing_last_name(),
                'address_1' => $orden->get_billing_address_1(),
                'address_2' => $orden->get_billing_address_2(),
                'city' => $orden->get_billing_city(),
                'state' => $orden->get_billing_state(),
                'postcode' => $orden->get_billing_postcode(),
                'country' => $orden->get_billing_country(),
                'email' => $orden->get_billing_email(),
                'phone' => $orden->get_billing_phone(),
            ],
            'store' => [
               'shop_name' => get_option('woocommerce_store_name'),
               'address' => get_option('woocommerce_store_address'),
               'address_2' => get_option('woocommerce_store_address_2'),
               'city' => get_option('woocommerce_store_city'),
               'state' => get_option('woocommerce_default_country'),
               'postcode' => get_option('woocommerce_store_postcode'),
               'phone' => get_option('woocommerce_store_phone'),
               'email' => get_option('woocommerce_email_from_address'),
           ],
            'shipping' => [
                'first_name' => $orden->get_shipping_first_name(),
                'last_name' => $orden->get_shipping_last_name(),
                'address_1' => $orden->get_shipping_address_1(),
                'address_2' => $orden->get_shipping_address_2(),
                'city' => $orden->get_shipping_city(),
                'state' => $orden->get_shipping_state(),
                'postcode' => $orden->get_shipping_postcode(),
                'country' => $orden->get_shipping_country(),
            ],
            'line_items' => array_map( function( $item ) {
                return [
            'id' => $item->get_id(),
            'name' => $item->get_name(),
            'product_id' => $item->get_product_id(),
            'quantity' => $item->get_quantity(),
            'price' => ($item->get_quantity() != 0) ? $item->get_total() / $item->get_quantity() : 0, // Verificación de división por cero
            'subtotal' => $item->get_subtotal(),
            'total' => $item->get_total(),
                ];
            }, $orden->get_items() ),
            'shipping_lines' => array_map( function( $shipping_item ) {
                return [
                    'method_id' => $shipping_item->get_method_id(),
                    'method_title' => $shipping_item->get_method_title(),
                    'total' => $shipping_item->get_total(),
                ];
            }, $orden->get_shipping_methods() ),
            'payment_method' => $orden->get_payment_method(),
            'payment_method_title' => $orden->get_payment_method_title(),
        ];
    }

    return new WP_REST_Response( $resultado, 200 );
}
