'use client';

import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

const CCTV_VIDEOS = [
  {
    name: 'CCTV Gate Camera 3',
    path: '/cctv-gate%20cam%203.mp4',
  },
  {
    name: 'CCTV Gate',
    path: '/cctv-gate.mp4',
  },
  {
    name: 'CCTV Gate Walking',
    path: '/cctv-gatewalking.mp4',
  },
];

type PlacementMode = 'none' | 'person' | 'vehicle';

type Point3D = {
  id: number;
  type: 'person' | 'vehicle';
  x: number;
  y: number;
  z: number;
};

export default function SpatialReconstructionPage() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const frameCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const viewerRef = useRef<HTMLDivElement | null>(null);

  const threeSceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const imagePlaneRef = useRef<THREE.Mesh | null>(null);
  const personMeshRef = useRef<THREE.Mesh | null>(null);
  const vehicleMeshRef = useRef<THREE.Mesh | null>(null);
  const lineRef = useRef<THREE.Line | null>(null);

  const [selectedVideo, setSelectedVideo] = useState(
    CCTV_VIDEOS[0].path
  );

  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const [frameCaptured, setFrameCaptured] = useState(false);

  const [placementMode, setPlacementMode] =
    useState<PlacementMode>('none');

  const [points, setPoints] = useState<Point3D[]>([]);

  const [distance, setDistance] = useState<number | null>(
    null
  );

  const [status, setStatus] = useState(
    'Load a CCTV video and capture a frame.'
  );

  /*
   * ----------------------------------------------------
   * CALCULATE DISTANCE
   * ----------------------------------------------------
   */

  useEffect(() => {
    const person = points.find(
      (point) => point.type === 'person'
    );

    const vehicle = points.find(
      (point) => point.type === 'vehicle'
    );

    if (!person || !vehicle) {
      setDistance(null);
      return;
    }

    const dx = person.x - vehicle.x;
    const dy = person.y - vehicle.y;
    const dz = person.z - vehicle.z;

    const calculatedDistance = Math.sqrt(
      dx * dx + dy * dy + dz * dz
    );

    setDistance(
      Number(calculatedDistance.toFixed(2))
    );
  }, [points]);

  /*
   * ----------------------------------------------------
   * UPDATE 3D MARKERS
   * ----------------------------------------------------
   */

  useEffect(() => {
    if (!threeSceneRef.current) return;

    const scene = threeSceneRef.current;

    if (personMeshRef.current) {
      scene.remove(personMeshRef.current);
      personMeshRef.current.geometry.dispose();
      (
        personMeshRef.current.material as THREE.Material
      ).dispose();

      personMeshRef.current = null;
    }

    if (vehicleMeshRef.current) {
      scene.remove(vehicleMeshRef.current);
      vehicleMeshRef.current.geometry.dispose();
      (
        vehicleMeshRef.current.material as THREE.Material
      ).dispose();

      vehicleMeshRef.current = null;
    }

    if (lineRef.current) {
      scene.remove(lineRef.current);
      lineRef.current.geometry.dispose();
      (
        lineRef.current.material as THREE.Material
      ).dispose();

      lineRef.current = null;
    }

    const person = points.find(
      (point) => point.type === 'person'
    );

    const vehicle = points.find(
      (point) => point.type === 'vehicle'
    );

    /*
     * PERSON
     */

    if (person) {
      const geometry =
        new THREE.SphereGeometry(
          0.16,
          24,
          24
        );

      const material =
        new THREE.MeshStandardMaterial({
          color: 0xff4055,
          emissive: 0x330008,
        });

      const mesh =
        new THREE.Mesh(
          geometry,
          material
        );

      mesh.position.set(
        person.x,
        person.y,
        person.z
      );

      scene.add(mesh);

      personMeshRef.current = mesh;
    }

    /*
     * VEHICLE
     */

    if (vehicle) {
      const geometry =
        new THREE.BoxGeometry(
          0.45,
          0.25,
          0.8
        );

      const material =
        new THREE.MeshStandardMaterial({
          color: 0x4287ff,
          emissive: 0x061333,
        });

      const mesh =
        new THREE.Mesh(
          geometry,
          material
        );

      mesh.position.set(
        vehicle.x,
        vehicle.y,
        vehicle.z
      );

      scene.add(mesh);

      vehicleMeshRef.current = mesh;
    }

    /*
     * MEASUREMENT LINE
     */

    if (person && vehicle) {
      const geometry =
        new THREE.BufferGeometry().setFromPoints([
          new THREE.Vector3(
            person.x,
            person.y,
            person.z
          ),
          new THREE.Vector3(
            vehicle.x,
            vehicle.y,
            vehicle.z
          ),
        ]);

      const material =
        new THREE.LineBasicMaterial({
          color: 0xfacc15,
        });

      const line =
        new THREE.Line(
          geometry,
          material
        );

      scene.add(line);

      lineRef.current = line;
    }
  }, [points]);

  /*
   * ----------------------------------------------------
   * THREE.JS INITIALIZATION
   * ----------------------------------------------------
   */

  useEffect(() => {
    if (!viewerRef.current) return;

    const container = viewerRef.current;

    const scene =
      new THREE.Scene();

    scene.background =
      new THREE.Color(
        0x030a12
      );

    const camera =
      new THREE.PerspectiveCamera(
        55,
        container.clientWidth /
          container.clientHeight,
        0.1,
        1000
      );

    camera.position.set(
      0,
      1.5,
      6
    );

    camera.lookAt(
      0,
      0,
      0
    );

    const renderer =
      new THREE.WebGLRenderer({
        antialias: true,
      });

    renderer.setPixelRatio(
      Math.min(
        window.devicePixelRatio,
        2
      )
    );

    renderer.setSize(
      container.clientWidth,
      container.clientHeight
    );

    container.appendChild(
      renderer.domElement
    );

    threeSceneRef.current =
      scene;

    cameraRef.current =
      camera;

    rendererRef.current =
      renderer;

    /*
     * LIGHT
     */

    const ambient =
      new THREE.AmbientLight(
        0xffffff,
        1.5
      );

    scene.add(
      ambient
    );

    const directional =
      new THREE.DirectionalLight(
        0xffffff,
        2
      );

    directional.position.set(
      3,
      5,
      5
    );

    scene.add(
      directional
    );

    /*
     * GRID
     */

    const grid =
      new THREE.GridHelper(
        10,
        20,
        0x28627d,
        0x132c3c
      );

    grid.position.y =
      -1.7;

    scene.add(grid);

    /*
     * AXES
     */

    const axes =
      new THREE.AxesHelper(
        3
      );

    scene.add(axes);

    /*
     * IMAGE PLANE
     *
     * This will receive the captured
     * CCTV frame.
     */

    const texture =
      new THREE.CanvasTexture(
        document.createElement(
          'canvas'
        )
      );

    texture.colorSpace =
      THREE.SRGBColorSpace;

    const planeGeometry =
      new THREE.PlaneGeometry(
        5.5,
        3.1
      );

    const planeMaterial =
      new THREE.MeshBasicMaterial({
        map: texture,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.92,
      });

    const imagePlane =
      new THREE.Mesh(
        planeGeometry,
        planeMaterial
      );

    imagePlane.position.set(
      0,
      0,
      0
    );

    scene.add(
      imagePlane
    );

    imagePlaneRef.current =
      imagePlane;

    /*
     * MOUSE ROTATION
     */

    let dragging = false;
    let previousX = 0;
    let previousY = 0;

    const pointerDown = (
      event: PointerEvent
    ) => {
      dragging = true;

      previousX =
        event.clientX;

      previousY =
        event.clientY;

      renderer.domElement.style.cursor =
        'grabbing';
    };

    const pointerUp = () => {
      dragging = false;

      renderer.domElement.style.cursor =
        'grab';
    };

    const pointerMove = (
      event: PointerEvent
    ) => {
      if (!dragging) return;

      const dx =
        event.clientX -
        previousX;

      const dy =
        event.clientY -
        previousY;

      previousX =
        event.clientX;

      previousY =
        event.clientY;

      scene.rotation.y +=
        dx * 0.008;

      scene.rotation.x +=
        dy * 0.004;

      scene.rotation.x =
        Math.max(
          -0.8,
          Math.min(
            0.8,
            scene.rotation.x
          )
        );
    };

    /*
     * ZOOM
     */

    const wheel = (
      event: WheelEvent
    ) => {
      event.preventDefault();

      camera.position.z +=
        event.deltaY * 0.006;

      camera.position.z =
        Math.max(
          3,
          Math.min(
            12,
            camera.position.z
          )
        );
    };

    renderer.domElement.addEventListener(
      'pointerdown',
      pointerDown
    );

    renderer.domElement.addEventListener(
      'pointerup',
      pointerUp
    );

    renderer.domElement.addEventListener(
      'pointerleave',
      pointerUp
    );

    renderer.domElement.addEventListener(
      'pointermove',
      pointerMove
    );

    renderer.domElement.addEventListener(
      'wheel',
      wheel,
      {
        passive: false,
      }
    );

    /*
     * RESIZE
     */

    const resize =
      () => {
        camera.aspect =
          container.clientWidth /
          container.clientHeight;

        camera.updateProjectionMatrix();

        renderer.setSize(
          container.clientWidth,
          container.clientHeight
        );
      };

    window.addEventListener(
      'resize',
      resize
    );

    /*
     * RENDER
     */

    let animationFrame = 0;

    const animate =
      () => {
        animationFrame =
          requestAnimationFrame(
            animate
          );

        renderer.render(
          scene,
          camera
        );
      };

    animate();

    /*
     * CLEANUP
     */

    return () => {
      cancelAnimationFrame(
        animationFrame
      );

      window.removeEventListener(
        'resize',
        resize
      );

      renderer.domElement.removeEventListener(
        'pointerdown',
        pointerDown
      );

      renderer.domElement.removeEventListener(
        'pointerup',
        pointerUp
      );

      renderer.domElement.removeEventListener(
        'pointerleave',
        pointerUp
      );

      renderer.domElement.removeEventListener(
        'pointermove',
        pointerMove
      );

      renderer.domElement.removeEventListener(
        'wheel',
        wheel
      );

      renderer.dispose();

      if (
        container.contains(
          renderer.domElement
        )
      ) {
        container.removeChild(
          renderer.domElement
        );
      }
    };
  }, []);

  /*
   * ----------------------------------------------------
   * VIDEO
   * ----------------------------------------------------
   */

  const handleVideoLoaded =
    () => {
      const video =
        videoRef.current;

      if (!video) return;

      setDuration(
        video.duration || 0
      );

      setCurrentTime(
        video.currentTime
      );

      setStatus(
        'CCTV video loaded.'
      );
    };

  const handleVideoTime =
    () => {
      const video =
        videoRef.current;

      if (!video) return;

      setCurrentTime(
        video.currentTime
      );
    };

  /*
   * ----------------------------------------------------
   * CAPTURE FRAME
   * ----------------------------------------------------
   */

  const captureFrame =
    () => {
      const video =
        videoRef.current;

      const canvas =
        frameCanvasRef.current;

      const plane =
        imagePlaneRef.current;

      if (
        !video ||
        !canvas ||
        !plane
      ) {
        return;
      }

      if (
        video.videoWidth === 0 ||
        video.videoHeight === 0
      ) {
        setStatus(
          'Video frame is not ready.'
        );

        return;
      }

      canvas.width =
        video.videoWidth;

      canvas.height =
        video.videoHeight;

      const context =
        canvas.getContext(
          '2d'
        );

      if (!context) return;

      context.drawImage(
        video,
        0,
        0,
        canvas.width,
        canvas.height
      );

      const texture =
        new THREE.CanvasTexture(
          canvas
        );

      texture.colorSpace =
        THREE.SRGBColorSpace;

      texture.needsUpdate =
        true;

      const material =
        plane.material as THREE.MeshBasicMaterial;

      if (material.map) {
        material.map.dispose();
      }

      material.map =
        texture;

      material.needsUpdate =
        true;

      setFrameCaptured(
        true
      );

      setStatus(
        `CCTV frame captured at ${video.currentTime.toFixed(
          2
        )} seconds and loaded into the 3D scene.`
      );
    };

  /*
   * ----------------------------------------------------
   * CLICK ON 3D IMAGE
   * ----------------------------------------------------
   */

  const placeObject =
    (
      event: React.MouseEvent
    ) => {
      if (
        placementMode ===
        'none'
      ) {
        return;
      }

      const container =
        viewerRef.current;

      const camera =
        cameraRef.current;

      const scene =
        threeSceneRef.current;

      const plane =
        imagePlaneRef.current;

      if (
        !container ||
        !camera ||
        !scene ||
        !plane
      ) {
        return;
      }

      const rect =
        container.getBoundingClientRect();

      const mouse =
        new THREE.Vector2();

      mouse.x =
        ((event.clientX -
          rect.left) /
          rect.width) *
          2 -
        1;

      mouse.y =
        -(
          ((event.clientY -
            rect.top) /
            rect.height) *
            2 -
          1
        );

      const raycaster =
        new THREE.Raycaster();

      raycaster.setFromCamera(
        mouse,
        camera
      );

      const intersections =
        raycaster.intersectObject(
          plane
        );

      if (
        intersections.length === 0
      ) {
        setStatus(
          'Click directly on the CCTV frame in the 3D scene.'
        );

        return;
      }

      const point =
        intersections[0].point;

      const newPoint: Point3D = {
        id: Date.now(),
        type:
          placementMode ===
          'person'
            ? 'person'
            : 'vehicle',
        x: Number(
          point.x.toFixed(3)
        ),
        y: Number(
          point.y.toFixed(3)
        ),
        z: Number(
          point.z.toFixed(3)
        ),
      };

      setPoints(
        (current) => {
          const filtered =
            current.filter(
              (item) =>
                item.type !==
                newPoint.type
            );

          return [
            ...filtered,
            newPoint,
          ];
        }
      );

      setStatus(
        `${
          newPoint.type ===
          'person'
            ? 'Person'
            : 'Vehicle'
        } placed in reconstructed scene.`
      );

      setPlacementMode(
        'none'
      );
    };

  /*
   * ----------------------------------------------------
   * RESET
   * ----------------------------------------------------
   */

  const resetScene =
    () => {
      setPoints([]);
      setPlacementMode(
        'none'
      );

      setStatus(
        frameCaptured
          ? '3D reconstruction reset. CCTV frame remains loaded.'
          : 'Load a CCTV frame first.'
      );
    };

  /*
   * ----------------------------------------------------
   * SEEK
   * ----------------------------------------------------
   */

  const seekVideo =
    (
      value: number
    ) => {
      const video =
        videoRef.current;

      if (!video) return;

      video.currentTime =
        value;

      setCurrentTime(
        value
      );
    };

  return (
    <main
      style={{
        minHeight:
          '100vh',
        background:
          '#020711',
        color:
          '#e7f4ff',
        padding:
          '24px',
        fontFamily:
          'Arial, sans-serif',
      }}
    >
      <div
        style={{
          maxWidth:
            '1450px',
          margin:
            '0 auto',
        }}
      >

        {/* HEADER */}

        <header
          style={{
            display:
              'flex',
            justifyContent:
              'space-between',
            alignItems:
              'center',
            gap:
              '20px',
            marginBottom:
              '20px',
            flexWrap:
              'wrap',
          }}
        >
          <div>
            <div
              style={{
                color:
                  '#48d8cf',
                fontSize:
                  '12px',
                letterSpacing:
                  '3px',
              }}
            >
              NEXORA / FORENSIC OPERATIONS
            </div>

            <h1
              style={{
                margin:
                  '6px 0',
                fontSize:
                  '30px',
              }}
            >
              Spatial Reconstruction
            </h1>

            <p
              style={{
                margin:
                  0,
                color:
                  '#8ca5ba',
              }}
            >
              CCTV frame → 3D reference scene → spatial analysis
            </p>
          </div>

          <a
            href="/"
            style={{
              color:
                '#9ee7ff',
              border:
                '1px solid #24445a',
              padding:
                '10px 16px',
              borderRadius:
                '8px',
              textDecoration:
                'none',
            }}
          >
            ← Back to NEXORA
          </a>
        </header>

        {/* VIDEO */}

        <section
          style={{
            border:
              '1px solid #19364b',
            borderRadius:
              '12px',
            background:
              '#07111d',
            padding:
              '18px',
            marginBottom:
              '18px',
          }}
        >
          <div
            style={{
              display:
                'flex',
              justifyContent:
                'space-between',
              marginBottom:
                '12px',
            }}
          >
            <div>
              <div
                style={{
                  fontSize:
                    '11px',
                  color:
                    '#7893a8',
                  letterSpacing:
                    '1px',
                }}
              >
                EVIDENCE VIDEO
              </div>

              <h2
                style={{
                  margin:
                    '4px 0',
                  fontSize:
                    '18px',
                }}
              >
                CCTV Source
              </h2>
            </div>

            <span
              style={{
                color:
                  '#4ade80',
                fontSize:
                  '11px',
              }}
            >
              LOCAL FILE
            </span>
          </div>

          <select
            value={
              selectedVideo
            }
            onChange={(
              event
            ) => {
              setSelectedVideo(
                event.target.value
              );

              setFrameCaptured(
                false
              );

              setPoints([]);

              setStatus(
                'New CCTV video selected. Capture a frame.'
              );
            }}
            style={{
              width:
                '100%',
              background:
                '#091827',
              color:
                '#e8f6ff',
              border:
                '1px solid #24445a',
              padding:
                '11px',
              borderRadius:
                '7px',
              marginBottom:
                '14px',
            }}
          >
            {CCTV_VIDEOS.map(
              (video) => (
                <option
                  key={
                    video.path
                  }
                  value={
                    video.path
                  }
                >
                  {video.name}
                </option>
              )
            )}
          </select>

          <video
            ref={
              videoRef
            }
            src={
              selectedVideo
            }
            controls
            onLoadedMetadata={
              handleVideoLoaded
            }
            onTimeUpdate={
              handleVideoTime
            }
            style={{
              width:
                '100%',
              maxHeight:
                '460px',
              background:
                '#000',
              borderRadius:
                '8px',
              display:
                'block',
            }}
          />

          <div
            style={{
              display:
                'flex',
              alignItems:
                'center',
              gap:
                '10px',
              marginTop:
                '14px',
              flexWrap:
                'wrap',
            }}
          >
            <input
              type="range"
              min="0"
              max={
                duration || 0
              }
              step="0.01"
              value={
                Math.min(
                  currentTime,
                  duration || 0
                )
              }
              onChange={(
                event
              ) =>
                seekVideo(
                  Number(
                    event.target
                      .value
                  )
                )
              }
              style={{
                flex:
                  1,
                minWidth:
                  '200px',
              }}
            />

            <span
              style={{
                fontSize:
                  '12px',
                color:
                  '#8ca5ba',
              }}
            >
              {currentTime.toFixed(
                2
              )}s /{' '}
              {duration.toFixed(
                2
              )}s
            </span>

            <button
              onClick={
                captureFrame
              }
              style={{
                border:
                  '1px solid #267c78',
                background:
                  '#0b292a',
                color:
                  '#7ff5eb',
                padding:
                  '10px 16px',
                borderRadius:
                  '7px',
                cursor:
                  'pointer',
                fontWeight:
                  600,
              }}
            >
              📸 Capture Frame
            </button>
          </div>

          <div
            style={{
              marginTop:
                '12px',
              padding:
                '10px',
              background:
                '#081724',
              border:
                '1px solid #18394d',
              borderRadius:
                '7px',
              color:
                '#8ca7b9',
              fontSize:
                '12px',
            }}
          >
            {status}
          </div>

          <canvas
            ref={
              frameCanvasRef
            }
            style={{
              display:
                'none',
            }}
          />
        </section>

        {/* MAIN 3D */}

        <div
          style={{
            display:
              'grid',
            gridTemplateColumns:
              'minmax(0, 1fr) 310px',
            gap:
              '18px',
          }}
        >

          {/* VIEWER */}

          <section
            style={{
              border:
                '1px solid #19364b',
              borderRadius:
                '12px',
              overflow:
                'hidden',
                background:
                '#07111d',
            }}
          >
            <div
              style={{
                padding:
                  '14px 16px',
                borderBottom:
                  '1px solid #19364b',
                display:
                  'flex',
                justifyContent:
                  'space-between',
                alignItems:
                  'center',
              }}
            >
              <span>
                3D RECONSTRUCTION VIEWER
              </span>

              <span
                style={{
                  color:
                    frameCaptured
                      ? '#4ade80'
                      : '#8095a6',
                  fontSize:
                    '11px',
                }}
              >
                {frameCaptured
                  ? 'FRAME LOADED'
                  : 'WAITING FOR FRAME'}
              </span>
            </div>

            <div
              ref={
                viewerRef
              }
              onClick={
                placeObject
              }
              style={{
                width:
                  '100%',
                height:
                  '620px',
                cursor:
                  placementMode !==
                  'none'
                    ? 'crosshair'
                    : 'grab',
              }}
            />
          </section>

          {/* CONTROLS */}

          <aside
            style={{
              border:
                '1px solid #19364b',
              borderRadius:
                '12px',
              background:
                '#07111d',
              padding:
                '18px',
              height:
                'fit-content',
            }}
          >
            <h2
              style={{
                marginTop:
                  0,
                fontSize:
                  '18px',
              }}
            >
              Reconstruction Tools
            </h2>

            <div
              style={{
                padding:
                  '14px',
                borderRadius:
                  '8px',
                background:
                  '#0b1b2b',
                marginBottom:
                  '16px',
              }}
            >
              <div
                style={{
                  color:
                    '#7893a8',
                  fontSize:
                    '11px',
                }}
              >
                SPATIAL DISTANCE
              </div>

              <div
                style={{
                  color:
                    '#facc15',
                  fontSize:
                    '30px',
                  marginTop:
                    '5px',
                }}
              >
                {distance !==
                null
                  ? `${distance.toFixed(
                      2
                    )} m`
                  : '--'}
              </div>

              <div
                style={{
                  color:
                    '#71889c',
                  fontSize:
                    '11px',
                }}
              >
                Person → Vehicle
              </div>
            </div>

            <div
              style={{
                display:
                  'grid',
                gap:
                  '8px',
              }}
            >
              <button
                onClick={() =>
                  setPlacementMode(
                    'person'
                  )
                }
                style={{
                  padding:
                    '11px',
                  border:
                    '1px solid #79333d',
                  background:
                    placementMode ===
                    'person'
                      ? '#54202a'
                      : '#26151a',
                  color:
                    '#ff7180',
                  borderRadius:
                    '7px',
                  cursor:
                    'pointer',
                }}
              >
                🧍 Select Person
              </button>

              <button
                onClick={() =>
                  setPlacementMode(
                    'vehicle'
                  )
                }
                style={{
                  padding:
                    '11px',
                  border:
                    '1px solid #315994',
                  background:
                    placementMode ===
                    'vehicle'
                      ? '#18325c'
                      : '#101e35',
                  color:
                    '#72a8ff',
                  borderRadius:
                    '7px',
                  cursor:
                    'pointer',
                }}
              >
                🚗 Select Vehicle
              </button>

              <button
                onClick={
                  resetScene
                }
                style={{
                  padding:
                    '11px',
                  border:
                    '1px solid #38495a',
                  background:
                    '#101a24',
                  color:
                    '#b7c9d8',
                  borderRadius:
                    '7px',
                  cursor:
                    'pointer',
                }}
              >
                ↻ Reset Reconstruction
              </button>
            </div>

            <div
              style={{
                marginTop:
                  '18px',
                padding:
                  '12px',
                border:
                  '1px solid #21475d',
                background:
                  '#081724',
                borderRadius:
                  '8px',
                fontSize:
                  '12px',
                color:
                  '#8eacbd',
                lineHeight:
                  1.6,
              }}
            >
              <strong
                style={{
                  color:
                    '#dcefff',
                }}
              >
                How to use
              </strong>

              <br />
              1. Select a CCTV video.
              <br />
              2. Move to the required frame.
              <br />
              3. Click Capture Frame.
              <br />
              4. Click Select Person.
              <br />
              5. Click the person position
              in the 3D frame.
              <br />
              6. Click Select Vehicle.
              <br />
              7. Click the vehicle position.
            </div>

            <div
              style={{
                marginTop:
                  '16px',
                padding:
                  '12px',
                border:
                  '1px solid #604c20',
                background:
                  '#191407',
                borderRadius:
                  '8px',
                color:
                  '#d7bd72',
                fontSize:
                  '11px',
                lineHeight:
                  1.5,
              }}
            >
              ⚠️ The current coordinates are
              image-plane geometry. They are NOT
              true physical depth measurements yet.
              Camera calibration and validated depth
              estimation are required for that.
            </div>

            <div
              style={{
                marginTop:
                  '16px',
                padding:
                  '12px',
                border:
                  '1px solid #21475d',
                background:
                  '#081724',
                borderRadius:
                  '8px',
                color:
                  '#8eacbd',
                fontSize:
                  '11px',
                lineHeight:
                  1.5,
              }}
            >
              <strong
                style={{
                  color:
                    '#dcefff',
                }}
              >
                Next stage
              </strong>

              <br />

              Local AI depth estimation will
              generate an approximate depth map
              from the selected CCTV frame.
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}