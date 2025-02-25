"use client";
import { useEffect, useState } from "react";
import Upload from "./Upload";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { GLTFExporter } from "three/examples/jsm/exporters/GLTFExporter";
import { STLExporter } from "three/examples/jsm/exporters/STLExporter";
import { OBJExporter } from "three/examples/jsm/exporters/OBJExporter";
import "./globals.css"; // globals.css dosyasını içe aktar

export default function Home() {
  const [uploadedFile, setUploadedFile] = useState(null);
  const [wallHeight, setWallHeight] = useState(100); // Başlangıç değeri 100
  const [selectedTexture, setSelectedTexture] = useState(null);
  const [textures, setTextures] = useState([]);
  const [language, setLanguage] = useState("en"); // Varsayılan dil: İngilizce
  const [scene, setScene] = useState(null); // 3D sahneyi saklamak için
  const [exportFormat, setExportFormat] = useState("gltf"); // Varsayılan format: GLTF

  // Dil seçenekleri
  const translations = {
    tr: {
      siteName: "Easy 2D Home Plans to 3D Walls",
      upload: "Dosya Yükle",
      wallHeight: "Duvar Yüksekliği",
      createModel: "3D Model Oluştur",
      downloadModel: "Modeli İndir",
      controlsHelp: "Modeli kontrol etmek için: \n- Sol tık ile döndürün. \n- Sağ tık ile taşıyın. \n- Fare tekerleği ile yakınlaştırın/uzaklaştırın.",
      about: "Hakkında",
      donation: "Bağış",
      ads: "Reklamlar",
      aboutText: "Bu site, yüklediğiniz görüntülerden 3D modeller oluşturmanıza olanak tanır. OpenCV.js ve Three.js kütüphaneleri kullanılarak geliştirilmiştir.",
      donationText: "Projemizi desteklemek için bağış yapabilirsiniz. Bağışlarınız, sitenin geliştirilmesi ve sunucu maliyetlerinin karşılanması için kullanılacaktır.",
      adsText: "Sitemizde reklam vermek isterseniz, lütfen bizimle iletişime geçin.",
      donateButton: "Bağış Yap",
      language: "Dil",
      selectFormat: "İndirme Formatı Seçin",
    },
    en: {
      siteName: "Easy 2D Home Plans to 3D Walls",
      upload: "Upload File",
      wallHeight: "Wall Height",
      createModel: "Create 3D Model",
      downloadModel: "Download Model",
      controlsHelp: "To control the model: \n- Left click to rotate. \n- Right click to pan. \n- Scroll to zoom in/out.",
      about: "About",
      donation: "Donation",
      ads: "Ads",
      aboutText: "This site allows you to create 3D models from uploaded images. It is developed using OpenCV.js and Three.js libraries.",
      donationText: "You can support our project by making a donation. Your donations will be used for the development of the site and server costs.",
      adsText: "If you want to advertise on our site, please contact us.",
      donateButton: "Donate",
      language: "Language",
      selectFormat: "Select Download Format",
    },
    es: {
      siteName: "Easy 2D Home Plans to 3D Walls",
      upload: "Subir Archivo",
      wallHeight: "Altura de la Pared",
      createModel: "Crear Modelo 3D",
      downloadModel: "Descargar Modelo",
      controlsHelp: "Para controlar el modelo: \n- Clic izquierdo para rotar. \n- Clic derecho para mover. \n- Rueda del ratón para acercar/alejar.",
      about: "Acerca de",
      donation: "Donación",
      ads: "Anuncios",
      aboutText: "Este sitio te permite crear modelos 3D a partir de imágenes subidas. Está desarrollado utilizando las bibliotecas OpenCV.js y Three.js.",
      donationText: "Puedes apoyar nuestro proyecto haciendo una donación. Tus donaciones se utilizarán para el desarrollo del sitio y los costos del servidor.",
      adsText: "Si deseas anunciarte en nuestro sitio, por favor contáctanos.",
      donateButton: "Donar",
      language: "Idioma",
      selectFormat: "Seleccionar Formato de Descarga",
    },
    fr: {
      siteName: "Easy 2D Home Plans to 3D Walls",
      upload: "Téléverser un Fichier",
      wallHeight: "Hauteur du Mur",
      createModel: "Créer un Modèle 3D",
      downloadModel: "Télécharger le Modèle",
      controlsHelp: "Pour contrôler le modèle: \n- Clic gauche pour faire pivoter. \n- Clic droit pour déplacer. \n- Molette de la souris pour zoomer/dézoomer.",
      about: "À Propos",
      donation: "Don",
      ads: "Publicités",
      aboutText: "Ce site vous permet de créer des modèles 3D à partir d'images téléversées. Il est développé en utilisant les bibliothèques OpenCV.js et Three.js.",
      donationText: "Vous pouvez soutenir notre projet en faisant un don. Vos dons seront utilisés pour le développement du site et les coûts du serveur.",
      adsText: "Si vous souhaitez faire de la publicité sur notre site, veuillez nous contacter.",
      donateButton: "Faire un Don",
      language: "Langue",
      selectFormat: "Sélectionner le Format de Téléchargement",
    },
  };

  const t = translations[language]; // Mevcut dil için çeviriler

  useEffect(() => {
    // OpenCV.js yükleme
    if (!document.getElementById("opencv-script")) {
      const script = document.createElement("script");
      script.id = "opencv-script";
      script.src = "https://docs.opencv.org/4.5.2/opencv.js";
      script.async = true;
      script.onload = () => console.log("OpenCV.js yüklendi!");
      document.body.appendChild(script);
    }

    // Texture'ları elle oluştur
    const createTexture = (color, text) => {
      const canvas = document.createElement("canvas");
      canvas.width = 512;
      canvas.height = 512;
      const context = canvas.getContext("2d");

      // Arka plan rengi
      context.fillStyle = color;
      context.fillRect(0, 0, canvas.width, canvas.height);

      // Metin ekle (örneğin, texture türü)
      context.font = "bold 50px Arial";
      context.fillStyle = "white";
      context.textAlign = "center";
      context.textBaseline = "middle";
      context.fillText(text, canvas.width / 2, canvas.height / 2);

      const texture = new THREE.CanvasTexture(canvas);
      texture.needsUpdate = true; // Texture'u güncelle
      return texture;
    };

    const loadedTextures = [
      createTexture("#8B4513", "Tuğla"), // Tuğla texture
      createTexture("#808080", "Taş"),   // Taş texture
      createTexture("#A0522D", "Ahşap"), // Ahşap texture
    ];
    setTextures(loadedTextures);
    setSelectedTexture(loadedTextures[0]); // Varsayılan texture olarak tuğlayı seç
  }, []);

  const handleFileUpload = (file) => {
    setUploadedFile(file);
  };

  const processImageAndGenerate3D = () => {
    if (typeof cv === "undefined") {
      console.error("OpenCV.js henüz yüklenmedi.");
      return;
    }

    const imgElement = document.createElement("img");
    imgElement.src = URL.createObjectURL(uploadedFile);
    imgElement.onload = () => {
      const src = cv.imread(imgElement);
      const gray = new cv.Mat();
      const blurred = new cv.Mat();
      const binary = new cv.Mat();
      const contours = new cv.MatVector();
      const hierarchy = new cv.Mat();

      // Görüntüyü gri tonlamalı hale getir ve bulanıklaştır
      cv.cvtColor(src, gray, cv.COLOR_RGBA2GRAY, 0);
      cv.GaussianBlur(gray, blurred, new cv.Size(5, 5), 0);

      // Eşikleme uygula (siyah-beyaz hale getir)
      cv.threshold(blurred, binary, 128, 255, cv.THRESH_BINARY);

      // Kenar tespiti yap
      cv.Canny(blurred, binary, 150, 350);

      // Konturları bul
      cv.findContours(binary, contours, hierarchy, cv.RETR_LIST, cv.CHAIN_APPROX_SIMPLE);

      // Konturları filtrele
      const detectedContours = [];
      for (let i = 0; i < contours.size(); i++) {
        const contour = contours.get(i);
        const area = cv.contourArea(contour);
        if (area > 500 && area < 1000000) { // Belirli bir alan aralığındaki konturları seç
          detectedContours.push(contour);
        }
      }

      // 3D model oluştur
      generate3DModel(detectedContours);

      // Belleği temizle
      src.delete();
      gray.delete();
      blurred.delete();
      binary.delete();
      hierarchy.delete();
    };
  };

  const generate3DModel = (contours) => {
    if (contours.length === 0) {
      alert(t.noContoursFound || "No contours found!");
      return;
    }
  
    const container = document.getElementById("threeContainer");
    container.innerHTML = "";
  
    const newScene = new THREE.Scene();
    setScene(newScene); // Sahneyi state'e kaydet
  
    // Kamerayı oluştur
    const camera = new THREE.PerspectiveCamera(
      75, // Görüş açısı
      window.innerWidth / 800, // En-boy oranı
      0.1, // Yakın düzlem
      5000 // Uzak düzlem
    );
    camera.position.set(0, 200, 500);
    camera.lookAt(0, 0, 0);
  
    const renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, 800);
    container.appendChild(renderer.domElement);
  
    // OrbitControls'u başlat
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true; // Damping etkinleştir
    controls.dampingFactor = 0.1; // Damping faktörünü azalt
    controls.screenSpacePanning = false;
    controls.minDistance = 100;
    controls.maxDistance = 2000;
  
    // Işık kaynakları ekle (parlaklık azaltıldı)
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4); // Yoğunluk: 0.5
    newScene.add(ambientLight);
  
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5); // Yoğunluk: 0.5
    directionalLight.position.set(0, 1, 1).normalize();
    directionalLight.castShadow = false; // Gölgeleri kapat
    newScene.add(directionalLight);
  
    // HemisphereLight ekle (gökyüzü ve yer ışığı)
    const hemisphereLight = new THREE.HemisphereLight(0x87CEEB, 0x8B4513, 0.5); // Yoğunluk: 0.5
    newScene.add(hemisphereLight);
  
    // CubeTextureLoader ile gökyüzü dokularını yükle
    const cubeTextureLoader = new THREE.CubeTextureLoader();
    cubeTextureLoader.setPath("/textures/sky/"); // Dokuların bulunduğu klasör
  
    const skyTexture = cubeTextureLoader.load([
      "px.jpg", // Sağ
      "nx.jpg", // Sol
      "py.jpg", // Üst
      "ny.jpg", // Alt
      "pz.jpg", // Arka
      "nz.jpg"  // Ön
    ], () => {
      console.log("Gökyüzü dokuları yüklendi!");
    }, undefined, (error) => {
      console.error("Gökyüzü dokuları yüklenirken hata oluştu:", error);
    });
  
    // Gökyüzünü sahnenin arka planına ekle
    newScene.background = skyTexture;
  
    // Çimen dokusunu yükle
    const textureLoader = new THREE.TextureLoader();
    const grassTexture = textureLoader.load("/textures/grass.jpg", (texture) => {
      console.log("Çimen dokusu yüklendi!");
    }, undefined, (error) => {
      console.error("Çimen dokusu yüklenirken hata oluştu:", error);
    });
    grassTexture.wrapS = THREE.RepeatWrapping;
    grassTexture.wrapT = THREE.RepeatWrapping;
    grassTexture.repeat.set(10, 10); // Dokuyu tekrarla
  
    // Zemin oluştur
    const groundGeometry = new THREE.PlaneGeometry(8000, 8000); // Daha geniş bir zemin
    const groundMaterial = new THREE.MeshStandardMaterial({
      map: grassTexture, // Çimen dokusunu uygula
      side: THREE.DoubleSide, // Her iki tarafı da görünür yap
    });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2; // Zemini yatay hale getir
    ground.position.y = 0; // Zemini biraz aşağıya indir
    newScene.add(ground);
  
    // Konturları 3D modele dönüştür
    contours.forEach((contour) => {
      const points = [];
      for (let j = 0; j < contour.data32S.length; j += 2) {
        points.push(new THREE.Vector3(contour.data32S[j], -contour.data32S[j + 1], 0));
      }
  
      if (points.length > 2) {
        const shape = new THREE.Shape(points.map(p => new THREE.Vector2(p.x, p.y)));
        const geometry = new THREE.ExtrudeGeometry(shape, {
          depth: wallHeight,
          bevelEnabled: false,
        });
  
        // UV koordinatlarını elle ayarla
        const uvAttribute = geometry.getAttribute("uv");
        for (let i = 0; i < uvAttribute.count; i++) {
          const u = uvAttribute.getX(i);
          const v = uvAttribute.getY(i);
          uvAttribute.setXY(i, u * 2, v * 2); // UV koordinatlarını ölçeklendir
        }
  
        // Texture'lu materyal oluştur
        const material = new THREE.MeshStandardMaterial({ map: selectedTexture });
        const mesh = new THREE.Mesh(geometry, material);
        mesh.rotation.x = -Math.PI / 2;
        newScene.add(mesh);
  
        // Kenar çizgileri
        const edges = new THREE.EdgesGeometry(geometry);
        const lineMaterial = new THREE.LineBasicMaterial({ color: 0x000000, linewidth: 3 });
        const line = new THREE.LineSegments(edges, lineMaterial);
        line.rotation.x = -Math.PI / 2;
        newScene.add(line);
      }
    });
  
    // Animasyon döngüsü
    const animate = () => {
      requestAnimationFrame(animate);
      controls.update(); // OrbitControls'u güncelle
      renderer.render(newScene, camera); // Sahneyi render et
    };
    animate();
  };
  const downloadModel = () => {
    if (!scene) {
      alert(t.noModelToDownload || "No model to download!");
      return;
    }

    switch (exportFormat) {
      case "gltf":
        const gltfExporter = new GLTFExporter();
        gltfExporter.parse(
          scene,
          (gltf) => {
            const output = JSON.stringify(gltf, null, 2);
            const blob = new Blob([output], { type: "model/gltf+json" });
            const link = document.createElement("a");
            link.href = URL.createObjectURL(blob);
            link.download = "model.gltf";
            link.click();
          },
          (error) => {
            console.error("GLTF indirme hatası:", error);
          }
        );
        break;

      case "stl":
        const stlExporter = new STLExporter();
        const stlData = stlExporter.parse(scene);
        const stlBlob = new Blob([stlData], { type: "application/sla" });
        const stlLink = document.createElement("a");
        stlLink.href = URL.createObjectURL(stlBlob);
        stlLink.download = "model.stl";
        stlLink.click();
        break;

      case "obj":
        const objExporter = new OBJExporter();
        const objData = objExporter.parse(scene);
        const objBlob = new Blob([objData], { type: "text/plain" });
        const objLink = document.createElement("a");
        objLink.href = URL.createObjectURL(objBlob);
        objLink.download = "model.obj";
        objLink.click();
        break;

      default:
        alert(t.invalidFormat || "Invalid format selected!");
        break;
    }
  };

  return (
    <div className="container">
      {/* Site İsmi */}
      <header className="header">
        <h1>{t.siteName}</h1>
      </header>
  
      {/* Dil Seçeneği */}
      <div className="language-selector">
        <select onChange={(e) => setLanguage(e.target.value)}>
          <option value="en">English</option>
          <option value="tr">Türkçe</option>
          <option value="es">Español</option>
          <option value="fr">Français</option>
        </select>
      </div>
  
      {/* Navigasyon Menüsü */}
      <nav className="navbar">
        <a href="#about">{t.about}</a>
        <a href="#donation">{t.donation}</a>
        <a href="#ads">{t.ads}</a>
      </nav>
  
      {/* Ana İçerik */}
      <main className="main-content">
        <Upload onFileUpload={handleFileUpload} uploadText={t.upload} />
        {uploadedFile && (
          <div className="controls">
            <input
              type="number"
              value={wallHeight}
              onChange={(e) => setWallHeight(Number(e.target.value))}
              placeholder={t.wallHeight}
            />
            <select onChange={(e) => setSelectedTexture(textures[e.target.value])}>
              {textures.map((texture, index) => (
                <option key={index} value={index}>
                  {texture.name}
                </option>
              ))}
            </select>
            <button onClick={processImageAndGenerate3D}>{t.createModel}</button>
            <select onChange={(e) => setExportFormat(e.target.value)}>
              <option value="gltf">GLTF</option>
              <option value="stl">STL</option>
              <option value="obj">OBJ</option>
            </select>
            <button onClick={downloadModel}>{t.downloadModel}</button>
          </div>
        )}
  
        {/* 3D Önizleme */}
        <div className="preview-container">
          <p className="help-text">{t.controlsHelp}</p>
          <div className="three-wrapper">
            <div id="threeContainer" style={{ width: "100%", height: "800px" }}></div>
          </div>
        </div>
      </main>
  
      {/* Hakkında Bölümü */}
      <section id="about" className="section">
        <h2>{t.about}</h2>
        <p>{t.aboutText}</p>
      </section>
  
      {/* Bağış Bölümü */}
      <section id="donation" className="section">
        <h2>{t.donation}</h2>
        <p>{t.donationText}</p>
        <button className="donate-button">{t.donateButton}</button>
      </section>
  
      {/* Reklamlar Bölümü */}
      <section id="ads" className="section">
        <h2>{t.ads}</h2>
        <p>{t.adsText}</p>
      </section>
  
      {/* Footer */}
      <footer className="footer">
        <p>&copy; 2023 3D Model Creator. All rights reserved.</p>
      </footer>
    </div>
  );
}