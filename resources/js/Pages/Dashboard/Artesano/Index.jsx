import React, { useState, useEffect } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Link, Head, router } from '@inertiajs/react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { useRef } from 'react';
import Maps from '@/Components/home/Maps';

export default function Index({ stats, user, tienda }) {
    const [showSuccessMessage, setShowSuccessMessage] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');

    // Verificar si hay un mensaje de éxito en parámetros de URL
    useEffect(() => {
        console.log('Dashboard cargado, verificando parámetros de URL...');
        console.log('URL completa:', window.location.href);
        console.log('Search params:', window.location.search);
        
        const urlParams = new URLSearchParams(window.location.search);
        const successParam = urlParams.get('success');
        console.log('Parámetro success encontrado:', successParam);
        
        let message = null;
        if (successParam === 'created') {
            message = '¡Producto creado con éxito!';
            console.log('Mensaje de creación asignado:', message);
        } else if (successParam === 'updated') {
            message = '¡Producto editado con éxito!';
            console.log('Mensaje de edición asignado:', message);
        }
        
        if (message) {
            console.log('Configurando mensaje de éxito:', message);
            setSuccessMessage(message);
            setShowSuccessMessage(true);
            console.log('Mensaje mostrado:', message);
            console.log('Estado showSuccessMessage:', true);
            // Limpiar el parámetro de la URL
            window.history.replaceState({}, document.title, window.location.pathname);
            setTimeout(() => {
                console.log('Ocultando mensaje después de 8 segundos');
                setShowSuccessMessage(false);
            }, 8000); // Ocultar después de 8 segundos
        } else {
            console.log('No se encontró mensaje para mostrar');
        }
    }, []);

    // Función para construir la URL correcta de la imagen
    const getImageUrl = (imagePath) => {
        // Si la ruta ya incluye 'storage/', devolverla directamente
        if (imagePath.startsWith('storage/')) {
            return `/${imagePath}`;
        }
        // Si la ruta comienza con 'productos/', añadir '/storage/'
        if (imagePath.startsWith('productos/')) {
            return `/storage/${imagePath}`;
        }
        // Para cualquier otro caso, asumir que es una ruta relativa a storage
        return `/storage/${imagePath}`;
    };

    // Función para manejar errores de carga de imágenes
    const handleImageError = (e) => {
        console.error('Error al cargar imagen:', e.target.src);
        e.target.onerror = null;
        e.target.src = 'https://via.placeholder.com/300x200?text=Imagen+no+disponible';
    };

    const [profilePhoto, setProfilePhoto] = useState(user.profile_photo || null);
    const fileInputRef = useRef(null);
    const handlePhotoChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const formData = new FormData();
            formData.append('profile_photo', file);
            router.post(route('profile.photo.update'), formData, {
                onSuccess: (page) => {
                    setProfilePhoto(page.props.auth.user.profile_photo);
                },
            });
        }
    };

    const [carouselIndexes, setCarouselIndexes] = useState({});
    const handlePrev = (productoId, totalImages) => {
    setCarouselIndexes(prev => {
        const currentIndex = prev[productoId] ?? 0;
        const newIndex = (currentIndex - 1 + totalImages) % totalImages;
        return { ...prev, [productoId]: newIndex };
    });
};

const handleNext = (productoId, totalImages) => {
    setCarouselIndexes(prev => {
        const currentIndex = prev[productoId] ?? 0;
        const newIndex = (currentIndex + 1) % totalImages;
        return { ...prev, [productoId]: newIndex };
    });
};

const location = {
    lat: parseFloat(user.latitude),
    lng: parseFloat(user.longitude),
    name: user.residence_municipality
}

    return (
        <AuthenticatedLayout>
            <div className="min-h-screen bg-gray-100">
                {/* Mensaje de éxito */}
                {showSuccessMessage && (
                    <div className="fixed top-4 right-4 z-50 bg-green-50 border border-green-200 rounded-lg p-4 shadow-lg">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <div className="ml-3">
                                <p className="text-sm font-medium text-green-800">
                                    {successMessage}
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Contenido principal */}
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                        {/* Columna izquierda - Información personal y tienda */}
                        <div className="lg:col-span-1">
                            {/* Información del perfil */}
                            <div className="bg-white rounded-lg shadow p-10 mb-10 w-full max-w-full mx-auto">
                                <div className="flex items-center space-x-4">
                                    <div className="flex-shrink-0">
                                        <div className="h-20 w-20 rounded-full bg-white border-4 border-white shadow-lg overflow-hidden ring-2 ring-gray-100 relative cursor-pointer" onClick={() => fileInputRef.current.click()}>
                                            {profilePhoto ? (
                                                <img
                                                    src={profilePhoto.startsWith('http') ? profilePhoto : `/storage/${profilePhoto}`}
                                                    alt="Foto de perfil"
                                                    className="h-full w-full object-cover"
                                                />
                                            ) : (
                                            <div className="absolute inset-0 bg-gradient-to-br from-gray-50 via-gray-100 to-gray-200 flex items-center justify-center">
                                                <span className="text-2xl font-medium text-gray-600">
                                                    {user.name.charAt(0)}{user.last_name.charAt(0)}
                                                </span>
                                                </div>
                                            )}
                                            <input
                                                type="file"
                                                accept="image/*"
                                                className="hidden"
                                                ref={fileInputRef}
                                                onChange={handlePhotoChange}
                                            />
                                            <div className="absolute bottom-0 right-0 bg-white rounded-full p-1 shadow-md">
                                                <svg className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536M9 13h3l8-8a2.828 2.828 0 10-4-4l-8 8v3zm0 0v3h3" />
                                                </svg>
                                            </div>
                                        </div>
                                    </div>
                                    <div>
                                        <div className="flex flex-col items-start">
                                            <h1 className="text-xl font-semibold text-gray-900 whitespace-nowrap">
                                                {user.name} {user.last_name}
                                            </h1>
                                            <span className="mt-1 px-2 py-0.5 text-xs font-medium bg-indigo-100 text-indigo-800 rounded-full">
                                                Artesano
                                            </span>
                                        </div>
                                        <div className="flex items-center mt-2">
                                            <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                            </svg>
                                            <span className="ml-1 text-sm text-gray-500">{user.residence_municipality}</span>
                                        </div>
                                    </div>


                                    
                                </div>
                            </div>

                            {/* Sección de Tienda */}
                            <div className="bg-white rounded-lg shadow p-10 mb-10 w-full max-w-full mx-auto">
                                <div className="flex justify-between items-center mb-4">
                                    {!tienda ? (
                                        <Link
                                            href={route('dashboard.artesano.create-tienda')}
                                            className="inline-flex items-center px-4 py-2 bg-[rgb(60,47,47)] text-white rounded-md hover:bg-[rgb(43,31,31)] transition-colors duration-200"
                                        >
                                            Crear Tienda
                                        </Link>
                                    ) : (
                                        <Link
                                            href={route('dashboard.artesano.gestionar-tienda')}
                                            className="inline-flex items-center px-4 py-2 bg-[rgb(60,47,47)] text-white rounded-md hover:bg-[rgb(43,31,31)] transition-colors duration-200 no-underline text-sm"
                                        >
                                            Gestionar Tienda
                                        </Link>
                                    )}
                                </div>
                                {tienda && (
                                    <div className="space-y-4">
                                        <div className="flex items-center space-x-4">
                                            <div className="flex-shrink-0">
                                                <div className="h-16 w-16 rounded-full bg-white border-2 border-gray-200 overflow-hidden flex items-center justify-center relative">
                                                    {tienda.foto_perfil ? (
                                                        <img
                                                            src={tienda.foto_perfil.startsWith('http') ? tienda.foto_perfil : `/storage/${tienda.foto_perfil}`}
                                                            alt={tienda.nombre}
                                                            className="h-full w-full object-cover"
                                                        />
                                                    ) : (
                                                        <span className="text-xl font-medium text-gray-600">
                                                            {tienda.nombre ? tienda.nombre.charAt(0) : '?'}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                            <div>
                                                <h3 className="text-lg font-medium text-gray-900">{tienda.nombre}</h3>
                                                <p className="text-sm text-gray-500">{tienda.municipio_venta}</p>
                                            </div>
                                        </div>
                                        <div className="border-t border-gray-200 pt-4">
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <p className="text-sm text-gray-500">Barrio</p>
                                                    <p className="font-medium">{tienda.barrio}</p>
                                                </div>
                                                <div>
                                                    <p className="text-sm text-gray-500">Teléfono</p>
                                                    <p className="font-medium">{tienda.telefono}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="bg-white rounded-lg shadow p-10 w-full max-w-full mx-auto">
                                <h3 className="text-lg font-semibold mb-4">Información de Contacto:</h3>
                                <div className="space-y-4">
                                    <div>
                                        <p className="text-sm text-gray-500">Teléfono</p>
                                        <p className="font-medium">{user.phone}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">Ubicación</p>
                                        <p className="font-medium">{user.residence_municipality}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Mapa */}
                            {user.latitude && user.longitude && (
                                <div className="mt-10 bg-white rounded-lg shadow p-10 w-full max-w-full mx-auto">
                                    <h2 className="text-lg font-semibold mb-4">Ubicación</h2>
                                    <div className="h-64 w-full rounded-lg overflow-hidden">
                                        <Maps position={location} />
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Columna derecha - Estadísticas y productos */}
                        <div className="lg:col-span-3">
                            {/* Estadísticas */}
                            <div className="bg-white rounded-lg shadow p-6 mb-6">
                                <h2 className="text-lg font-semibold mb-4">Actividad</h2>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div className="bg-gray-50 rounded-lg p-4 flex flex-col items-center">
                                        <p className="text-sm text-gray-500">Total Productos</p>
                                        <p className="text-2xl font-bold text-indigo-600">{stats.total_productos}</p>
                                    </div>
                                    <div className="bg-gray-50 rounded-lg p-4 flex flex-col items-center">
                                        <p className="text-sm text-gray-500">Total Ventas</p>
                                        <p className="text-2xl font-bold text-indigo-600">{stats.total_ventas}</p>
                                    </div>
                                    <div className="bg-gray-50 rounded-lg p-4 flex flex-col items-center">
                                        <p className="text-sm text-gray-500">Total Pedidos</p>
                                        <p className="text-2xl font-bold text-indigo-600">{stats.total_pedidos}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Productos */}
                            <div className="bg-white rounded-lg shadow p-6 w-full max-w-7xl mx-auto">
                                <div className="flex justify-between items-center mb-6">
                                    <h2 className="text-lg font-semibold">Mis Productos</h2>
                                    <Link
                                        href={route('dashboard.artesano.create-producto')}
                                        className="inline-flex items-center px-4 py-2 bg-[rgb(60,47,47)] text-white rounded-md hover:bg-[rgb(43,31,31)] transition-colors duration-200 no-underline text-base"
                                    >
                                        Agregar Producto
                                    </Link>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8 w-full">
                                    {stats.productos.map((producto) => {
                                        // Depuración en consola
                                        console.log(`Producto ${producto.id} - Imágenes:`, producto.imagenes);
                                        
                                        // Obtener la imagen principal o la primera imagen
                                        const imagenPrincipal = producto.imagenes?.find(img => img.es_principal) || producto.imagenes?.[0];
                                        
                                        const imagenes = producto.imagenes || [];
                                        const currentImg = carouselIndexes[producto.id] || 0;

                                        return (
                                            <div key={producto.id} className="bg-white border rounded-lg overflow-hidden shadow hover:shadow-md transition-shadow flex flex-col md:flex-row w-full">
                                                {/* Carrusel de imágenes */}
                                                <div className="relative h-48 md:h-auto md:w-48 w-full overflow-hidden bg-gray-100 flex-shrink-0 flex items-center justify-center">
                                                    {imagenes.length > 0 && (
                                                        <>
                                                            <img
                                                                src={getImageUrl(imagenes[currentImg]?.ruta_imagen)}
                                                                alt={producto.nombre}
                                                                className="h-full w-full object-contain"
                                                                onError={handleImageError}
                                                            />
                                                            {imagenes.length > 1 && (
                                                                <>
                                                                    <button
                                                                        onClick={() => handlePrev(producto.id, imagenes.length)}
                                                                        className="absolute left-2 top-1/2 -translate-y-1/2 border border-[#4B3A3A] text-[#4B3A3A] rounded-full p-1 w-8 h-8 flex items-center justify-center hover:bg-[#4B3A3A] hover:text-white transition-colors"
                                                                        aria-label="Anterior"
                                                                    >
                                                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
                                                                    </button>
                                                                    <button
                                                                        onClick={() => handleNext(producto.id, imagenes.length)}
                                                                        className="absolute right-2 top-1/2 -translate-y-1/2 border border-[#4B3A3A] text-[#4B3A3A] rounded-full p-1 w-8 h-8 flex items-center justify-center hover:bg-[#4B3A3A] hover:text-white transition-colors"
                                                                        aria-label="Siguiente"
                                                                    >
                                                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
                                                                    </button>
                                                                    <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
                                                                        {imagenes.map((_, idx) => (
                                                                            <span
                                                                                key={idx}
                                                                                className={`inline-block w-2 h-2 rounded-full ${idx === currentImg ? 'bg-[#4B3A3A]' : 'bg-gray-300'}`}
                                                                            />
                                                                        ))}
                                                                    </div>
                                                                </>
                                                            )}
                                                        </>
                                                    )}
                                                </div>
                                                
                                                <div className="p-4 flex-1 flex flex-col justify-between">
                                                    <div>
                                                        <h4 className="text-lg font-medium text-gray-900">{producto.nombre}</h4>
                                                        <p className="mt-1 text-sm text-gray-500 line-clamp-2">{producto.descripcion}</p>
                                                        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2">
                                                            <p className="text-sm">
                                                                <span className="font-medium">Precio:</span> ${producto.precio.toLocaleString()}
                                                            </p>
                                                            <p className="text-sm">
                                                                <span className="font-medium">Cantidad:</span> {producto.cantidad_disponible}
                                                            </p>
                                                            <p className="text-sm">
                                                                <span className="font-medium">Categoría:</span>{' '}
                                                                <span className="capitalize">{producto.categoria}</span>
                                                            </p>
                                                            <p className="text-sm">
                                                                <span className="font-medium">Técnica:</span>{' '}
                                                                <span className="capitalize">{producto.tecnica_artesanal.replace('_', ' ')}</span>
                                                            </p>
                                                            <p className="text-sm">
                                                                <span className="font-medium">Materia Prima:</span>{' '}
                                                                <span className="capitalize">{producto.materia_prima}</span>
                                                            </p>
                                                            <p className="text-sm">
                                                                <span className="font-medium">Color:</span>{' '}
                                                                <span className="capitalize">{producto.color || 'No especificado'}</span>
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <div className="mt-4 flex space-x-2">
                                                        <Link
                                                            href={route('dashboard.artesano.edit-producto', producto.id)}
                                                            className="inline-flex items-center px-3 py-1.5 bg-gray-800 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-gray-700"
                                                        >
                                                            Editar
                                                        </Link>
                                                        <button
                                                            onClick={() => {
                                                                if (confirm('¿Está seguro de que desea eliminar este producto?')) {
                                                                    router.delete(route('dashboard.artesano.delete-producto', producto.id));
                                                                }
                                                            }}
                                                            className="inline-flex items-center px-3 py-1.5 bg-red-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-red-700"
                                                        >
                                                            Eliminar
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>


                            
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}