import { useEffect, useMemo, useRef, useState } from "react";
import "./App.scss";

const asset = (path) => `/${path}`;

const WINDOW_PRESETS = {
	videos: {
		open: { x: 700, y: 100, width: 1160, height: 800 },
		closed: { x: 100, y: 50, width: 100, height: 100 },
	},
	files: {
		open: { x: 600, y: 60, width: 1160, height: 800 },
		closed: { x: 100, y: 150, width: 100, height: 100 },
	},
	browser: {
		open: { x: 500, y: 20, width: 700, height: 800 },
		closed: { x: 470, y: 950, width: 100, height: 100 },
	},
	profile: {
		open: { x: 200, y: 10, width: 1160, height: 800 },
		closed: { x: 800, y: 950, width: 100, height: 100 },
	},
	vision: {
		open: { x: 500, y: 100, width: 1200, height: 700 },
		closed: { x: 560, y: 950, width: 100, height: 100 },
	},
	vscode: {
		open: { x: 360, y: 55, width: 1320, height: 850 },
		closed: { x: 520, y: 950, width: 100, height: 100 },
	},
};

const desktopFolders = [
	{ id: "videos", label: "Surveillance" },
	{ id: "files", label: "Incident Files" },
	{ id: "archive", label: "Archive [LOCKED]" },
];

const videos = [
	{
		id: "preview1",
		title: "Incident - h232",
		thumb: "files/img/preview3.png",
		src: "files/mp4/video1.mp4",
		meta: "CAM D-Z21 · 23:14",
	},
	{
		id: "preview2",
		title: "Our newest invention",
		thumb: "files/img/preview4.png",
		src: "files/mp4/video2.mp4",
		meta: "ARO MEDIA · INTERNAL",
	},
	{
		id: "preview3",
		title: "Incident - h433",
		thumb: "files/img/preview2.png",
		src: "files/mp4/video3.mp4",
		meta: "CAM H-433 · DAMAGED",
	},
	{
		id: "preview4",
		title: "Incident - b413",
		thumb: "files/img/preview1.png",
		src: "files/mp4/video4.mp4",
		meta: "CAM B-413 · 23:26",
	},
	{
		id: "preview5",
		title: "Incident - ca13",
		thumb: "files/img/preview3.png",
		src: "files/mp4/video5.mp4",
		meta: "CAM CA-13 · CORRUPT",
	},
	{
		id: "preview6",
		title: "Psychological weapon",
		thumb: "files/img/preview4.png",
		src: "files/mp4/video6.mp4",
		meta: "RESEARCH MEDIA · L3",
	},
];

const documents = [
	{
		id: "file1",
		label: "ARO-2710-RU.pdf",
		src: "files/doc/ARO-2710-RU.pdf",
		meta: "CONTAMINATION · L3",
	},
	{
		id: "file2",
		label: "ARO-8761.pdf",
		src: "files/doc/ARO-8761.pdf",
		meta: "ANOMALY FILE · L2",
	},
	{
		id: "file3",
		label: "ARO-0923.pdf",
		src: "files/doc/ARO-0923.pdf",
		meta: "ARCHIVE COPY · L2",
	},
];

const menuApps = [
	{ id: "browser", label: "Browser", icon: "files/img/internet.png" },
	{
		id: "vision",
		label: "Vision",
		icon: "files/img/house_black.png",
		invert: true,
	},
	{ id: "vscode", label: "Log Checker", icon: "files/img/visual-studio.png" },
	{
		id: "profile",
		label: "Profile",
		icon: "files/img/manager.png",
		invert: true,
	},
	{ id: "security", label: "Security", icon: "files/img/vision.png" },
	{
		id: "settings",
		label: "Settings",
		icon: "files/img/svg/settings.svg",
		invert: true,
	},
];

const taskbarApps = [
	{ id: "browser", icon: "files/img/internet.png", label: "Browser" },
	{
		id: "vision",
		icon: "files/img/house_black.png",
		label: "Vision",
		invert: true,
	},
	{ id: "vscode", icon: "files/img/visual-studio.png", label: "Log Checker" },
	{
		id: "profile",
		icon: "files/img/manager.png",
		label: "Profile",
		invert: true,
	},
	{ id: "security", icon: "files/img/vision.png", label: "Security" },
];

function App() {
	const viewportScale = useViewportScale();
	const [introVisible, setIntroVisible] = useState(
		() => sessionStorage.getItem("introPlayed") !== "true",
	);
	const [introFading, setIntroFading] = useState(false);
	const [showIntroPlay, setShowIntroPlay] = useState(false);
	const [menuOpen, setMenuOpen] = useState(false);
	const [activeWindow, setActiveWindow] = useState(null);
	const [draggingWindow, setDraggingWindow] = useState(null);
	const [resizingWindow, setResizingWindow] = useState(null);
	const [zOrder, setZOrder] = useState([
		"videos",
		"files",
		"browser",
		"profile",
		"vision",
		"vscode",
	]);
	const [windows, setWindows] = useState(() =>
		Object.fromEntries(
			Object.entries(WINDOW_PRESETS).map(([id, preset]) => [
				id,
				{
					...preset.open,
					open: false,
					minimized: false,
					maximized: false,
					restore: { ...preset.open, maximized: false },
				},
			]),
		),
	);
	const [media, setMedia] = useState(null);
	const [selection, setSelection] = useState(null);
	const dragRef = useRef(null);
	const resizeRef = useRef(null);
	const desktopRef = useRef(null);
	const introVideoRef = useRef(null);
	const dateTime = useDateTime();

	const zIndexes = useMemo(
		() => Object.fromEntries(zOrder.map((id, index) => [id, 20 + index])),
		[zOrder],
	);

	useEffect(() => {
		const desktopWidth = viewportScale.width;
		const desktopHeight = viewportScale.height - 72;
		const growth = getResponsiveWindowGrowth(desktopWidth, desktopHeight);

		setWindows((current) =>
			Object.fromEntries(
				Object.entries(current).map(([id, win]) => {
					const base = WINDOW_PRESETS[id].open;
					const width = Math.round(base.width * growth);
					const height = Math.round(base.height * growth);
					const x = clamp(
						win.open ? win.x : win.restore.x,
						0,
						Math.max(0, desktopWidth - width),
					);
					const y = clamp(
						win.open ? win.y : win.restore.y,
						0,
						Math.max(0, desktopHeight - height),
					);
					const restore = { ...win.restore, x, y, width, height };

					return [
						id,
						win.open
							? { ...win, x, y, width, height, restore }
							: { ...win, restore },
					];
				}),
			),
		);
	}, [viewportScale.width, viewportScale.height]);

	const focusWindow = (id) => {
		setActiveWindow(id);
		setZOrder((order) => [...order.filter((item) => item !== id), id]);
	};

	const openWindow = (id) => {
		if (!WINDOW_PRESETS[id]) return;
		setWindows((current) => ({
			...current,
			[id]: {
				...current[id],
				...current[id].restore,
				open: true,
				minimized: false,
				maximized: current[id].restore.maximized,
			},
		}));
		setMenuOpen(false);
		focusWindow(id);
	};

	const toggleWindow = (id) => {
		if (!WINDOW_PRESETS[id]) return;
		setWindows((current) => ({
			...current,
			[id]: current[id].open
				? {
						...current[id],
						...WINDOW_PRESETS[id].closed,
						open: false,
						minimized: true,
						maximized: false,
						restore: getRestoreState(current[id]),
					}
				: {
						...current[id],
						...current[id].restore,
						open: true,
						minimized: false,
						maximized: current[id].restore.maximized,
					},
		}));
		setMenuOpen(false);
		if (!windows[id].open) {
			focusWindow(id);
		}
	};

	const closeWindow = (id) => {
		setWindows((current) => ({
			...current,
			[id]: {
				...current[id],
				...WINDOW_PRESETS[id].closed,
				open: false,
				minimized: false,
				maximized: false,
				restore: { ...WINDOW_PRESETS[id].open, maximized: false },
			},
		}));
		setActiveWindow((current) => (current === id ? null : current));
	};

	const minimizeWindow = (id) => {
		setWindows((current) => ({
			...current,
			[id]: {
				...current[id],
				...WINDOW_PRESETS[id].closed,
				open: false,
				minimized: true,
				maximized: false,
				restore: getRestoreState(current[id]),
			},
		}));
		setActiveWindow((current) => (current === id ? null : current));
	};

	const handleTaskbarAppClick = (id) => {
		if (windows[id]?.open) {
			minimizeWindow(id);
			return;
		}

		openWindow(id);
	};

	const toggleMaximize = (id) => {
		setWindows((current) => ({
			...current,
			[id]: {
				...current[id],
				maximized: !current[id].maximized,
				open: true,
				minimized: false,
			},
		}));
		focusWindow(id);
	};

	const startDrag = (event, id) => {
		if (event.button !== 0) return;
		const desktop = desktopRef.current?.getBoundingClientRect();
		if (!desktop) return;
		const win = windows[id];
		const interfaceScale = desktop.width / viewportScale.width;
		const logicalDesktopWidth = viewportScale.width;
		const logicalDesktopHeight = viewportScale.height - 72;
		const localPointerX = (event.clientX - desktop.left) / interfaceScale;
		const localPointerY = (event.clientY - desktop.top) / interfaceScale;
		const restoredX = win.maximized
			? clamp(
					localPointerX - win.width * (localPointerX / logicalDesktopWidth),
					0,
					Math.max(0, logicalDesktopWidth - win.width),
				)
			: win.x;
		const restoredY = win.maximized
			? clamp(
					localPointerY - 25,
					0,
					Math.max(0, logicalDesktopHeight - win.height),
				)
			: win.y;

		if (win.maximized) {
			setWindows((current) => ({
				...current,
				[id]: {
					...current[id],
					x: restoredX,
					y: restoredY,
					maximized: false,
					open: true,
					minimized: false,
				},
			}));
		}
		dragRef.current = {
			id,
			startX: event.clientX,
			startY: event.clientY,
			initialX: restoredX,
			initialY: restoredY,
			desktopWidth: logicalDesktopWidth,
			desktopHeight: logicalDesktopHeight,
			interfaceScale,
		};
		setDraggingWindow(id);
		focusWindow(id);
		event.currentTarget.setPointerCapture?.(event.pointerId);
	};

	const startResize = (event, id, direction) => {
		if (event.button !== 0 || windows[id].maximized) return;
		event.stopPropagation();
		const desktop = desktopRef.current?.getBoundingClientRect();
		if (!desktop) return;
		const win = windows[id];
		const interfaceScale = desktop.width / viewportScale.width;
		resizeRef.current = {
			id,
			direction,
			startX: event.clientX,
			startY: event.clientY,
			initialX: win.x,
			initialY: win.y,
			initialWidth: win.width,
			initialHeight: win.height,
			desktopWidth: viewportScale.width,
			desktopHeight: viewportScale.height - 72,
			interfaceScale,
		};
		setResizingWindow(id);
		focusWindow(id);
		event.currentTarget.setPointerCapture?.(event.pointerId);
	};

	const onPointerMove = (event) => {
		const resize = resizeRef.current;
		if (resize) {
			const dx = (event.clientX - resize.startX) / resize.interfaceScale;
			const dy = (event.clientY - resize.startY) / resize.interfaceScale;
			let left = resize.initialX;
			let top = resize.initialY;
			let right = resize.initialX + resize.initialWidth;
			let bottom = resize.initialY + resize.initialHeight;
			const minWidth = 480;
			const minHeight = 320;

			if (resize.direction.includes("e"))
				right = clamp(right + dx, left + minWidth, resize.desktopWidth);
			if (resize.direction.includes("s"))
				bottom = clamp(bottom + dy, top + minHeight, resize.desktopHeight);
			if (resize.direction.includes("w"))
				left = clamp(left + dx, 0, right - minWidth);
			if (resize.direction.includes("n"))
				top = clamp(top + dy, 0, bottom - minHeight);

			setWindows((current) => {
				const resized = {
					...current[resize.id],
					x: left,
					y: top,
					width: right - left,
					height: bottom - top,
				};
				return {
					...current,
					[resize.id]: { ...resized, restore: getRestoreState(resized) },
				};
			});
			return;
		}

		const drag = dragRef.current;
		if (drag) {
			const preset = windows[drag.id];
			const nextX =
				drag.initialX + (event.clientX - drag.startX) / drag.interfaceScale;
			const nextY =
				drag.initialY + (event.clientY - drag.startY) / drag.interfaceScale;
			const maxX = Math.max(0, drag.desktopWidth - preset.width);
			const maxY = Math.max(0, drag.desktopHeight - preset.height);
			setWindows((current) => ({
				...current,
				[drag.id]: {
					...current[drag.id],
					x: clamp(nextX, 0, maxX),
					y: clamp(nextY, 0, maxY),
				},
			}));
			return;
		}

		if (selection) {
			const bounds = desktopRef.current?.getBoundingClientRect();
			if (!bounds) return;
			const x = clamp(event.clientX - bounds.left, 0, bounds.width);
			const y = clamp(event.clientY - bounds.top, 0, bounds.height);
			setSelection(
				(current) => current && { ...current, x2: x, y2: y, active: true },
			);
		}
	};

	const stopPointerAction = () => {
		dragRef.current = null;
		resizeRef.current = null;
		setDraggingWindow(null);
		setResizingWindow(null);
		setSelection(null);
	};

	const startSelection = (event) => {
		if (event.button !== 0) return;
		if (!event.target.closest(".start-menu")) {
			setMenuOpen(false);
		}
		if (
			event.target.closest(
				"button, input, embed, audio, video, .window, .start-menu",
			)
		)
			return;
		const bounds = desktopRef.current?.getBoundingClientRect();
		if (!bounds) return;
		const x = event.clientX - bounds.left;
		const y = event.clientY - bounds.top;
		setMenuOpen(false);
		setSelection({ x1: x, y1: y, x2: x, y2: y, active: false });
	};

	useEffect(() => {
		const clearSelection = () => {
			dragRef.current = null;
			resizeRef.current = null;
			setDraggingWindow(null);
			setResizingWindow(null);
			setSelection(null);
		};
		const onKeyDown = (event) => {
			if (event.key === "Escape") clearSelection();
		};
		const onVisibilityChange = () => {
			if (document.hidden) clearSelection();
		};

		window.addEventListener("blur", clearSelection);
		window.addEventListener("resize", clearSelection);
		window.addEventListener("scroll", clearSelection, true);
		document.addEventListener("visibilitychange", onVisibilityChange);
		document.addEventListener("keydown", onKeyDown);

		return () => {
			window.removeEventListener("blur", clearSelection);
			window.removeEventListener("resize", clearSelection);
			window.removeEventListener("scroll", clearSelection, true);
			document.removeEventListener("visibilitychange", onVisibilityChange);
			document.removeEventListener("keydown", onKeyDown);
		};
	}, []);

	useEffect(() => {
		if (!introVisible) return;
		const video = introVideoRef.current;
		if (!video) return;

		video.play().catch(() => {
			setShowIntroPlay(true);
		});
	}, [introVisible]);

	const endIntro = () => {
		setIntroFading(true);
		sessionStorage.setItem("introPlayed", "true");
		window.setTimeout(() => setIntroVisible(false), 700);
	};

	const playIntro = () => {
		introVideoRef.current?.play();
		setShowIntroPlay(false);
	};

	return (
		<div
			className={`aro-shell ${viewportScale.expanded ? "is-expanded" : ""}`}
			style={{
				transform: `scale(${viewportScale.scale})`,
				left: viewportScale.left,
				top: viewportScale.top,
				width: viewportScale.width,
				height: viewportScale.height,
				gridTemplateRows: `${viewportScale.height - 72}px 72px`,
			}}
		>
			<div
				className="desktop"
				ref={desktopRef}
				onPointerDown={startSelection}
				onPointerMove={onPointerMove}
				onPointerUp={stopPointerAction}
				onPointerCancel={stopPointerAction}
			>
				<section className="desktop-icons" aria-label="Desktop folders">
					{desktopFolders.map((folder) => (
						<button
							type="button"
							className="desktop-icon"
							key={folder.id}
							onClick={() => folder.id !== "archive" && toggleWindow(folder.id)}
						>
							<img src={asset("files/img/folder.png")} alt="" />
							<span>{folder.label}</span>
						</button>
					))}
				</section>

				<FolderWindow
					id="videos"
					title="Surveillance Archive // Zone 21"
					win={windows.videos}
					zIndex={zIndexes.videos}
					active={activeWindow === "videos"}
					dragging={draggingWindow === "videos"}
					resizing={resizingWindow === "videos"}
					onFocus={focusWindow}
					onClose={closeWindow}
					onMinimize={minimizeWindow}
					onMaximize={toggleMaximize}
					onDragStart={startDrag}
					onResizeStart={startResize}
				>
					<ExplorerApp
						title="Surveillance Archive"
						path="ZONE 21 / RECORDINGS"
						items={videos.map((video) => ({
							...video,
							label: video.title,
							icon: video.thumb,
							mediaType: "video",
						}))}
						onOpen={(item) =>
							setMedia({
								type: item.mediaType,
								src: item.src,
								title: item.label,
							})
						}
					/>
				</FolderWindow>

				<FolderWindow
					id="files"
					title="Incident Files // Level 2"
					win={windows.files}
					zIndex={zIndexes.files}
					active={activeWindow === "files"}
					dragging={draggingWindow === "files"}
					resizing={resizingWindow === "files"}
					onFocus={focusWindow}
					onClose={closeWindow}
					onMinimize={minimizeWindow}
					onMaximize={toggleMaximize}
					onDragStart={startDrag}
					onResizeStart={startResize}
				>
					<ExplorerApp
						title="Incident Files"
						path="ZONE 21 / INCIDENT ARCHIVE"
						items={[
							...documents.map((doc) => ({
								...doc,
								icon: "files/img/pdf.png",
								mediaType: "pdf",
							})),
							{
								id: "audio1",
								label: "sound1.mp3",
								src: "files/mp3/audio1.MP3",
								icon: "files/img/mp3.png",
								mediaType: "audio",
								meta: "AUDIO TRACE · UNKNOWN",
							},
						]}
						onOpen={(item) =>
							setMedia({
								type: item.mediaType,
								src: item.src,
								title: item.label,
							})
						}
					/>
				</FolderWindow>

				<AppWindow
					id="browser"
					title="Browser"
					win={windows.browser}
					zIndex={zIndexes.browser}
					active={activeWindow === "browser"}
					dragging={draggingWindow === "browser"}
					resizing={resizingWindow === "browser"}
					onFocus={focusWindow}
					onClose={closeWindow}
					onMinimize={minimizeWindow}
					onMaximize={toggleMaximize}
					onDragStart={startDrag}
					onResizeStart={startResize}
				>
					<BrowserApp onRequestClose={() => closeWindow("browser")} />
				</AppWindow>

				<AppWindow
					id="vscode"
					title="ARO Log Checker — CORE-C4-TUNNELS.DAT"
					win={windows.vscode}
					zIndex={zIndexes.vscode}
					active={activeWindow === "vscode"}
					dragging={draggingWindow === "vscode"}
					resizing={resizingWindow === "vscode"}
					onFocus={focusWindow}
					onClose={closeWindow}
					onMinimize={minimizeWindow}
					onMaximize={toggleMaximize}
					onDragStart={startDrag}
					onResizeStart={startResize}
				>
					<LogCheckerApp />
				</AppWindow>

				<AppWindow
					id="profile"
					title="ARO Personnel Registry — ARO-Z21-ENG-084"
					win={windows.profile}
					zIndex={zIndexes.profile}
					active={activeWindow === "profile"}
					dragging={draggingWindow === "profile"}
					resizing={resizingWindow === "profile"}
					onFocus={focusWindow}
					onClose={closeWindow}
					onMinimize={minimizeWindow}
					onMaximize={toggleMaximize}
					onDragStart={startDrag}
					onResizeStart={startResize}
				>
					<ProfileApp />
				</AppWindow>

				<AppWindow
					id="vision"
					title="Vision"
					win={windows.vision}
					zIndex={zIndexes.vision}
					active={activeWindow === "vision"}
					dragging={draggingWindow === "vision"}
					resizing={resizingWindow === "vision"}
					onFocus={focusWindow}
					onClose={closeWindow}
					onMinimize={minimizeWindow}
					onMaximize={toggleMaximize}
					onDragStart={startDrag}
					onResizeStart={startResize}
				>
					<VisionApp />
				</AppWindow>

				<StartMenu open={menuOpen} toggleWindow={toggleWindow} />
				{selection && <SelectionBox selection={selection} />}
				{media && <MediaOverlay media={media} onClose={() => setMedia(null)} />}
			</div>

			<footer className="taskbar">
				<div className="taskbar-start">
					<button
						type="button"
						className="start-button"
						onClick={() => setMenuOpen((open) => !open)}
					>
						<img src={asset("files/img/letter-a.png")} alt="ARO" />
					</button>
					<label className="taskbar-search">
						<span className="search-mark">Search</span>
						<input type="text" placeholder="Type here to search" />
					</label>
				</div>
				<nav className="taskbar-apps" aria-label="Programs">
					{taskbarApps.map((app) => (
						<button
							type="button"
							key={app.id}
							className={`${windows[app.id]?.open || windows[app.id]?.minimized ? "is-running" : ""} ${
								activeWindow === app.id ? "is-active" : ""
							}`}
							onClick={() => handleTaskbarAppClick(app.id)}
							title={app.label}
						>
							<img
								className={app.invert ? "invert" : ""}
								src={asset(app.icon)}
								alt=""
							/>
						</button>
					))}
				</nav>
				<aside className="system-tray">
					<button type="button" title="Hidden icons">
						<img
							className="invert"
							src={asset("files/img/up-arrow.png")}
							alt=""
						/>
					</button>
					<button type="button" title="Wi-Fi">
						<img
							className="invert"
							src={asset("files/img/no-wifi.png")}
							alt=""
						/>
					</button>
					<button type="button" title="Volume">
						<img
							className="invert"
							src={asset("files/img/volume.png")}
							alt=""
						/>
					</button>
					<time dateTime={dateTime.iso}>
						<span>{dateTime.date}</span>
						<span>{dateTime.time}</span>
					</time>
				</aside>
			</footer>

			{introVisible && (
				<div className={`intro ${introFading ? "is-fading" : ""}`}>
					<video
						ref={introVideoRef}
						autoPlay
						playsInline
						preload="auto"
						onEnded={endIntro}
					>
						<source
							src={asset("files/mp4/ARO_ARIVE_02.mp4")}
							type="video/mp4"
						/>
					</video>
					{showIntroPlay && (
						<button type="button" className="play-intro" onClick={playIntro}>
							Play Intro
						</button>
					)}
					<button type="button" className="skip-intro" onClick={endIntro}>
						Skip
					</button>
				</div>
			)}
			<div className="static-overlay" aria-hidden="true" />
		</div>
	);
}

function AppWindow({
	id,
	title,
	win,
	zIndex,
	active,
	dragging,
	resizing,
	onFocus,
	onClose,
	onMinimize,
	onMaximize,
	onDragStart,
	onResizeStart,
	children,
}) {
	const style = win.maximized
		? { left: 0, top: 0, width: "100%", height: "100%", zIndex }
		: { left: win.x, top: win.y, width: win.width, height: win.height, zIndex };

	return (
		<article
			className={`window ${win.open ? "is-open" : "is-closed"} ${active ? "is-active" : ""} ${
				dragging ? "is-dragging" : ""
			} ${resizing ? "is-resizing" : ""} ${win.maximized ? "is-maximized" : ""}`}
			style={style}
			onPointerDown={() => win.open && onFocus(id)}
		>
			<WindowHeader
				title={title}
				onClose={() => onClose(id)}
				onMaximize={() => onMaximize(id)}
				onMinimize={() => onMinimize(id)}
				onPointerDown={(event) => onDragStart(event, id)}
			/>
			<div className="window-body">{children}</div>
			{!win.maximized &&
				["n", "ne", "e", "se", "s", "sw", "w", "nw"].map((direction) => (
					<div
						className={`resize-handle resize-handle--${direction}`}
						key={direction}
						onPointerDown={(event) => onResizeStart(event, id, direction)}
						aria-hidden="true"
					/>
				))}
		</article>
	);
}

function FolderWindow(props) {
	return <AppWindow {...props} />;
}

function WindowHeader({
	title,
	onClose,
	onMaximize,
	onMinimize,
	onPointerDown,
}) {
	const stopControlPointer = (event) => {
		event.stopPropagation();
	};

	return (
		<header className="window-header" onPointerDown={onPointerDown}>
			<strong>{title}</strong>
			<div className="window-actions">
				<button
					type="button"
					onPointerDown={stopControlPointer}
					onClick={onMinimize}
					title="Minimize"
				>
					<img src={asset("files/img/svg/minimize.svg")} alt="" />
				</button>
				<button
					type="button"
					onPointerDown={stopControlPointer}
					onClick={onMaximize}
					title="Maximize"
				>
					<img src={asset("files/img/svg/maximize.svg")} alt="" />
				</button>
				<button
					type="button"
					className="close"
					onPointerDown={stopControlPointer}
					onClick={onClose}
					title="Close"
				>
					<img src={asset("files/img/svg/close.svg")} alt="" />
				</button>
			</div>
		</header>
	);
}

function ExplorerApp({ title, path, items, onOpen }) {
	const [query, setQuery] = useState("");
	const [category, setCategory] = useState("all");
	const [view, setView] = useState("grid");
	const [selectedId, setSelectedId] = useState(null);
	const categories = [
		["all", "All records"],
		["incident", "Incident media"],
		["restricted", "Restricted"],
	];
	const visibleItems = items.filter((item) => {
		const text = `${item.label} ${item.meta}`.toLowerCase();
		const matchesSearch = text.includes(query.toLowerCase());
		const matchesCategory =
			category === "all" ||
			(category === "incident" && /incident|cam|trace/i.test(text)) ||
			(category === "restricted" &&
				/l3|damaged|corrupt|unknown|contamination/i.test(text));
		return matchesSearch && matchesCategory;
	});
	const selectedItem = items.find((item) => item.id === selectedId);

	return (
		<section className="explorer-app">
			<header className="explorer-toolbar">
				<button
					type="button"
					className="explorer-home"
					onClick={() => {
						setCategory("all");
						setQuery("");
						setSelectedId(null);
					}}
					title="Archive root"
				>
					⌂
				</button>
				<div className="explorer-path">
					<button type="button" onClick={() => setCategory("all")}>
						ARO ARCHIVE
					</button>
					<span>›</span>
					<strong>{path}</strong>
				</div>
				<label className="explorer-search">
					<span>⌕</span>
					<input
						value={query}
						onChange={(event) => {
							setQuery(event.target.value);
							setSelectedId(null);
						}}
						placeholder="Search records"
					/>
					{query && (
						<button
							type="button"
							onClick={() => setQuery("")}
							aria-label="Clear search"
						>
							×
						</button>
					)}
				</label>
			</header>
			<div className="explorer-layout">
				<aside className="explorer-sidebar">
					<p>QUICK ACCESS</p>
					{categories.map(([id, label]) => (
						<button
							type="button"
							className={category === id ? "active" : ""}
							onClick={() => {
								setCategory(id);
								setSelectedId(null);
							}}
							key={id}
						>
							<img src={asset("files/img/folder.png")} alt="" />
							<span>{label}</span>
						</button>
					))}
					<div className="storage-meter">
						<span>LOCAL CACHE</span>
						<i>
							<b />
						</i>
						<small>71% INTEGRITY</small>
					</div>
				</aside>
				<main className="explorer-content">
					<header>
						<div>
							<p>ARO INTERNAL STORAGE</p>
							<h1>{title}</h1>
							<span>
								{visibleItems.length}{" "}
								{visibleItems.length === 1 ? "record" : "records"}
							</span>
						</div>
						<div className="view-controls">
							<button
								type="button"
								className={view === "grid" ? "active" : ""}
								onClick={() => setView("grid")}
								title="Grid view"
							>
								▦
							</button>
							<button
								type="button"
								className={view === "list" ? "active" : ""}
								onClick={() => setView("list")}
								title="List view"
							>
								☷
							</button>
						</div>
					</header>
					<div className={`file-grid file-grid--${view}`}>
						{visibleItems.map((item) => (
							<button
								type="button"
								className={`file-item ${selectedId === item.id ? "selected" : ""}`}
								onClick={() => setSelectedId(item.id)}
								onDoubleClick={() => onOpen(item)}
								key={item.id}
							>
								<img src={asset(item.icon)} alt="" />
								<span>{item.label}</span>
								<small>{item.meta}</small>
							</button>
						))}
						{visibleItems.length === 0 && (
							<div className="empty-folder">
								<img src={asset("files/img/folder.png")} alt="" />
								<strong>No matching records</strong>
								<span>Change the category or search term.</span>
							</div>
						)}
					</div>
					<footer>
						<span>
							{selectedItem
								? `${selectedItem.label} // ${selectedItem.meta}`
								: "SELECT A RECORD · DOUBLE-CLICK TO OPEN"}
						</span>
						{selectedItem && (
							<button type="button" onClick={() => onOpen(selectedItem)}>
								OPEN RECORD
							</button>
						)}
					</footer>
				</main>
			</div>
		</section>
	);
}

function BrowserApp({ onRequestClose }) {
	const makeTab = (id) => ({
		id,
		title: "New Tab",
		address: "aro://new-tab",
		requestedAddress: "aro://new-tab",
	});
	const [tabs, setTabs] = useState(() => [
		{
			...makeTab(1),
			title: "ARO Uplink",
			address: "https://uplink.aro.int/",
			requestedAddress: "https://uplink.aro.int/",
		},
	]);
	const [activeTabId, setActiveTabId] = useState(1);
	const nextTabId = useRef(2);
	const [loading, setLoading] = useState(false);
	const activeTab = tabs.find((tab) => tab.id === activeTabId) || tabs[0];

	const updateActiveTab = (changes) => {
		setTabs((current) =>
			current.map((tab) =>
				tab.id === activeTabId ? { ...tab, ...changes } : tab,
			),
		);
	};

	const addTab = () => {
		const id = nextTabId.current++;
		setTabs((current) => [...current, makeTab(id)]);
		setActiveTabId(id);
		setLoading(false);
	};

	const closeTab = (event, id) => {
		event.stopPropagation();
		if (tabs.length === 1) {
			const resetId = nextTabId.current++;
			setTabs([makeTab(resetId)]);
			setActiveTabId(resetId);
			setLoading(false);
			onRequestClose();
			return;
		}

		const closingIndex = tabs.findIndex((tab) => tab.id === id);
		const remaining = tabs.filter((tab) => tab.id !== id);
		setTabs(remaining);
		if (id === activeTabId) {
			setActiveTabId(
				remaining[Math.min(closingIndex, remaining.length - 1)].id,
			);
			setLoading(false);
		}
	};

	const navigate = (event) => {
		event.preventDefault();
		const next = activeTab.address.trim() || "aro://new-tab";
		setLoading(true);
		window.setTimeout(() => {
			const title =
				next === "aro://new-tab"
					? "New Tab"
					: next.replace(/^https?:\/\//, "").split("/")[0] || "ARO Uplink";
			updateActiveTab({ requestedAddress: next, title });
			setLoading(false);
		}, 500);
	};

	const reload = () => {
		setLoading(true);
		window.setTimeout(() => setLoading(false), 500);
	};

	return (
		<section className="browser-app">
			<div className="browser-tabs">
				<div className="browser-tab-list">
					{tabs.map((tab) => (
						<button
							type="button"
							className={`browser-tab ${tab.id === activeTabId ? "active" : ""}`}
							onClick={() => {
								setActiveTabId(tab.id);
								setLoading(false);
							}}
							key={tab.id}
						>
							<span className="tab-favicon">A</span>
							<span>{tab.title}</span>
							<span
								className="tab-close"
								role="button"
								aria-label={`Close ${tab.title} tab`}
								onClick={(event) => closeTab(event, tab.id)}
							>
								×
							</span>
						</button>
					))}
				</div>
				<button
					type="button"
					className="new-tab"
					aria-label="New tab"
					onClick={addTab}
				>
					+
				</button>
				<div className="browser-spacer" />
				<button
					type="button"
					className="browser-menu"
					aria-label="Browser menu"
				>
					•••
				</button>
			</div>
			<form className="browser-toolbar" onSubmit={navigate}>
				<div className="browser-nav">
					<button type="button" aria-label="Back">
						←
					</button>
					<button type="button" aria-label="Forward" disabled>
						→
					</button>
					<button
						type="button"
						aria-label="Reload"
						onClick={reload}
						className={loading ? "spinning" : ""}
					>
						↻
					</button>
				</div>
				<label className="address-bar">
					<span className="connection-state" title="Internal connection">
						⌁
					</span>
					<input
						value={activeTab.address}
						onChange={(event) =>
							updateActiveTab({ address: event.target.value })
						}
						aria-label="Address and search bar"
						spellCheck="false"
					/>
					<button type="button" aria-label="Bookmark this page">
						☆
					</button>
				</label>
				<button
					type="button"
					className="browser-shield"
					aria-label="Network security"
				>
					▱
				</button>
			</form>
			<div className="bookmarks-bar">
				<button type="button">
					<span>▦</span> ARO Home
				</button>
				<button type="button">
					<span>◫</span> Personnel
				</button>
				<button type="button">
					<span>△</span> Incident Archive
				</button>
				<button type="button">
					<span>⚙</span> Infrastructure
				</button>
				<span className="managed-label">MANAGED BY ARO NETWORK SERVICES</span>
			</div>
			<div className={`browser-page ${loading ? "is-loading" : ""}`}>
				<div className="page-progress" />
				<main className="browser-error">
					<div className="error-symbol">
						<span>!</span>
						<i />
					</div>
					<p className="error-domain">
						ARO SECURE UPLINK // CONNECTION INTERRUPTED
					</p>
					<h1>
						Unable to reach the
						<br />
						proxy server
					</h1>
					<p className="error-copy">
						The internal gateway refused the connection. Zone 21 external uplink
						may be unavailable or isolated by emergency protocol.
					</p>
					<div className="error-address">
						<span>REQUESTED RESOURCE</span>
						<code>{activeTab.requestedAddress}</code>
					</div>
					<div className="error-actions">
						<button type="button" onClick={reload}>
							TRY AGAIN
						</button>
						<button type="button">DIAGNOSTICS</button>
					</div>
					<details>
						<summary>Technical information</summary>
						<ul>
							<li>Verify that network node Z21-PROXY is operational.</li>
							<li>Check emergency isolation and facility firewall status.</li>
							<li>
								Contact ARO Network Services if the sector is still staffed.
							</li>
						</ul>
					</details>
					<footer>
						<span>ERR_PROXY_CONNECTION_FAILED</span>
						<span>NODE: Z21-04</span>
					</footer>
				</main>
			</div>
		</section>
	);
}

function ProfileApp() {
	const [section, setSection] = useState("overview");
	const [authenticated, setAuthenticated] = useState(false);
	const [loginError, setLoginError] = useState("");
	const [loginBusy, setLoginBusy] = useState(false);

	const authenticate = (event) => {
		event.preventDefault();
		const form = new FormData(event.currentTarget);
		const operator = String(form.get("operator") || "")
			.trim()
			.toUpperCase();
		const cipher = String(form.get("cipher") || "")
			.trim()
			.toUpperCase();

		setLoginError("");
		setLoginBusy(true);
		window.setTimeout(() => {
			setLoginBusy(false);
			if (operator === "ARO-Z21-ENG-084" && cipher === "D-Z21") {
				setAuthenticated(true);
				return;
			}
			setLoginError(
				"CREDENTIAL PAIR REJECTED // ATTEMPT LOGGED AT NODE Z21-04",
			);
		}, 650);
	};

	const sections = {
		overview: (
			<>
				<RecordBlock code="01" title="Employment record">
					<DataGrid
						items={[
							["Employee ID", "ARO-Z21-ENG-084"],
							["Full name", "Ryo Hayashi"],
							["Position", "Senior Life Support Systems Engineer"],
							["Rank", "Engineer-Captain"],
							["Assigned facility", "ARO-Abyss-21 “Abyss”"],
							["Department", "ARO Infrastructure Engineering"],
							["Assigned sector", "Sector C / Life Support Systems"],
							["Work status", "Missing / presumed deceased"],
						]}
					/>
					<p className="record-note">
						Responsible for oxygen, pressure, water filtration, energy nodes,
						and emergency life-support infrastructure throughout Zone 21.
					</p>
				</RecordBlock>
				<RecordBlock code="02" title="Shift & maintenance record">
					<DataGrid
						items={[
							["Standard shift", "12-hour rotating technical duty"],
							["Emergency assignment", "Sector D-Z21 support response"],
							["Last registered shift", "Incident night"],
							["Last system login", "Pressure Control Terminal D-Z21"],
							[
								"Last confirmed action",
								"Manual override — pressure stabilization",
							],
							["Maintenance order", "Incomplete / logs corrupted"],
						]}
					/>
					<ul className="record-list">
						<li>Inspect pressure irregularities in lower technical tunnels</li>
						<li>Verify emergency section locks</li>
						<li>Check abnormal water movement reports</li>
					</ul>
				</RecordBlock>
				<RecordBlock code="03" title="Personal file note" alert>
					<p>
						Known for calm behavior during system failures. Frequently worked
						alone in lower maintenance sectors.
					</p>
					<p>
						Filed repeated complaints concerning “wrong pressure readings.”
						Reported metallic knocking from service shafts two days before
						signal loss.
					</p>
					<blockquote>
						“Pressure is not dropping. Something is pushing back from the other
						side.”<cite>FINAL INTERNAL MESSAGE // 14.12.2024</cite>
					</blockquote>
				</RecordBlock>
			</>
		),
		access: (
			<>
				<RecordBlock code="AC" title="Technical infrastructure card — Level 2">
					<div className="access-columns">
						<AccessList
							title="Access granted"
							items={[
								"Oxygen supply stations",
								"Pressure regulation rooms",
								"Water filtration systems",
								"Energy nodes",
								"Technical tunnels",
								"Service elevators",
								"Maintenance shafts",
							]}
						/>
						<AccessList
							title="Restricted"
							denied
							items={[
								"Scientific laboratories",
								"Anomaly containment chambers",
								"Central command systems",
							]}
						/>
						<AccessList
							title="Emergency permissions"
							items={[
								"Manual pressure control",
								"Shutdown of damaged emergency sections",
								"Opening service hatches and maintenance shafts",
							]}
						/>
					</div>
				</RecordBlock>
				<RecordBlock code="SX" title="Security observation" alert>
					<DataGrid
						items={[
							["Security risk", "Medium"],
							["Technical importance", "High"],
							["Facility dependency", "Critical"],
							["Combat role", "None"],
						]}
					/>
					<p className="warning-strip">
						LOCK RECOVERED CARD IMMEDIATELY — UNAUTHORIZED PRESSURE-SYSTEM
						ACCESS RISK
					</p>
				</RecordBlock>
			</>
		),
		incident: (
			<>
				<RecordBlock code="IR" title="Deep Rift" alert>
					<DataGrid
						items={[
							["Incident date", "14.12.2024"],
							["Location", "Sector D-Z21, Zone 21"],
							["Cause", "Energy and pressure system failure"],
							["Connected anomaly", "ARO-XXXX"],
							["Secondary hazard", "ARO-2710 spore contamination"],
							["Last signal", "15 minutes before sector destruction"],
						]}
					/>
					<div className="incident-timeline">
						<span>CONTAINMENT FAILURE</span>
						<i />
						<span>PRESSURE DAMAGE</span>
						<i />
						<span>POWER LOSS</span>
						<i />
						<span>SIGNAL LOST</span>
						<i />
						<span>SECTOR COLLAPSE</span>
					</div>
					<p>
						The failure spread ARO-2710 through sewage shafts and metro tunnels.
						Hayashi attempted to stabilize pressure systems during the
						containment breach and was presumed lost in the lower technical
						levels.
					</p>
				</RecordBlock>
				<RecordBlock code="MR" title="Medical & contamination notice">
					<DataGrid
						items={[
							["Pre-incident condition", "Fit for deep-sea facility work"],
							["Psychological status", "Cleared"],
							["Post-incident status", "Unknown"],
							["Exposure protocol", "ARO-2710 containment"],
						]}
					/>
					<p className="warning-strip">
						ANY BIOLOGICAL TRACE MUST BE TREATED AS CONTAMINATED
					</p>
				</RecordBlock>
			</>
		),
		recovery: (
			<RecordBlock code="RT" title="Recovery team record">
				<DataGrid
					items={[
						["Search priority", "Medium"],
						["Body recovery", "Not confirmed"],
						["Search status", "Suspended — unstable lower levels"],
						["Case status", "Open"],
					]}
				/>
				<h3>Recommended deployment</h3>
				<p>
					2 technical engineers · 2 security officers · 1 contamination
					specialist
				</p>
				<h3>Required protection</h3>
				<p>
					Full respirator · waterproof sealed suit · pressure-resistant
					equipment
				</p>
				<p className="warning-strip">
					DO NOT OPEN SEALED MAINTENANCE DOORS WITHOUT VERIFYING PRESSURE
					BALANCE
				</p>
				<div className="archive-note">
					<strong>ARCHIVE DIRECTIVE</strong>
					<p>
						Do not remove subject from active personnel database until physical
						confirmation is found.
					</p>
				</div>
			</RecordBlock>
		),
	};

	if (!authenticated) {
		return (
			<PersonnelLogin
				onSubmit={authenticate}
				error={loginError}
				busy={loginBusy}
			/>
		);
	}

	return (
		<section className="profile-app">
			<header className="registry-header">
				<div className="aro-wordmark">
					<span>ARO</span>
					<small>
						ANOMALY RESEARCH
						<br />
						ORGANIZATION
					</small>
				</div>
				<div className="registry-path">
					INTERNAL NETWORK / PERSONNEL / ZONE 21
				</div>
				<div className="registry-class">INTERNAL // L2</div>
			</header>
			<div className="profile-layout">
				<aside className="personnel-sidebar">
					<div className="portrait-frame">
						<img
							src={asset("files/img/employee.png")}
							alt="Personnel file portrait"
						/>
						<span>FILE IMAGE // 2024</span>
					</div>
					<div className="identity">
						<p className="eyebrow">ARO-Z21-ENG-084</p>
						<h1>
							RYO
							<br />
							HAYASHI
						</h1>
						<p>ENGINEER-CAPTAIN</p>
						<p>
							Senior Life Support
							<br />
							Systems Engineer
						</p>
					</div>
					<div className="status-stamp">
						<span>STATUS</span>
						<strong>MISSING</strong>
						<small>PRESUMED DECEASED</small>
					</div>
					<nav>
						{[
							["overview", "Overview"],
							["access", "Access"],
							["incident", "Incident"],
							["recovery", "Recovery"],
						].map(([id, label]) => (
							<button
								type="button"
								className={section === id ? "active" : ""}
								onClick={() => setSection(id)}
								key={id}
							>
								<span>{label}</span>
								<b>→</b>
							</button>
						))}
					</nav>
					<div className="card-readout">
						<span>CARD</span>
						<strong>TECH INFRASTRUCTURE</strong>
						<span>LEVEL 2 / NOT RECOVERED</span>
					</div>
				</aside>
				<main className="profile-records">
					<div className="record-toolbar">
						<span>PERSONNEL FILE</span>
						<span>LAST SYNC 14.12.2024 / 23:41</span>
						<button
							type="button"
							onClick={() => {
								setAuthenticated(false);
								setSection("overview");
							}}
						>
							END SESSION
						</button>
					</div>
					{sections[section]}
					<footer>
						ARO INFRASTRUCTURE ENGINEERING · ARCHIVE NODE Z21-04 · CASE OPEN
					</footer>
				</main>
			</div>
		</section>
	);
}

function PersonnelLogin({ onSubmit, error, busy }) {
	const [showCipher, setShowCipher] = useState(false);

	return (
		<section className="personnel-login">
			<header className="login-header">
				<div className="aro-wordmark">
					<span>ARO</span>
					<small>
						ANOMALY RESEARCH
						<br />
						ORGANIZATION
					</small>
				</div>
				<div>
					<span>PERSONNEL REGISTRY</span>
					<small>ARCHIVE NODE // Z21-04</small>
				</div>
				<p>
					CONNECTION: <b>LOCAL ONLY</b>
				</p>
			</header>
			<div className="login-stage">
				<div className="login-panel">
					<div className="login-index">
						<span>AUTH</span>
						<b>02</b>
						<small>LEVEL REQUIRED</small>
					</div>
					<div className="login-form-wrap">
						<p className="login-kicker">IDENTITY GATEWAY / INTERNAL</p>
						<h1>
							Personnel archive
							<br />
							authentication
						</h1>
						<p className="login-copy">
							Enter the assigned operator identifier and sector clearance
							cipher. All access attempts are retained in the incident archive.
						</p>
						<form onSubmit={onSubmit}>
							<label>
								<span>Operator identifier</span>
								<div className="terminal-input">
									<b>ID</b>
									<input
										name="operator"
										autoComplete="username"
										placeholder="ARO-XXX-XXX-000"
										required
										disabled={busy}
									/>
								</div>
							</label>
							<label>
								<span>Sector clearance cipher</span>
								<div className="terminal-input">
									<b>SC</b>
									<input
										name="cipher"
										type={showCipher ? "text" : "password"}
										autoComplete="current-password"
										placeholder="••••••"
										required
										disabled={busy}
									/>
									<button
										type="button"
										onClick={() => setShowCipher((value) => !value)}
									>
										{showCipher ? "HIDE" : "SHOW"}
									</button>
								</div>
							</label>
							<div
								className={`login-response ${error ? "has-error" : ""}`}
								aria-live="polite"
							>
								{busy ? (
									<>
										<i /> VERIFYING AGAINST LOCAL PERSONNEL CACHE...
									</>
								) : (
									error || "SYSTEM READY // AWAITING CREDENTIALS"
								)}
							</div>
							<button className="login-submit" type="submit" disabled={busy}>
								<span>{busy ? "AUTHENTICATING" : "OPEN PERSONNEL RECORD"}</span>
								<b>→</b>
							</button>
						</form>
					</div>
					<aside className="login-brief">
						<div className="security-glyph">
							<span>21</span>
							<i />
							<small>
								ABYSS
								<br />
								FACILITY
							</small>
						</div>
						<section>
							<h2>Recovered terminal note</h2>
							<p>
								Subject identifier remains indexed in the active personnel
								database.
							</p>
							<code>ARO-Z21-ENG-084</code>
						</section>
						<section>
							<h2>Last active sector</h2>
							<p>Clearance cipher follows emergency assignment.</p>
							<code>D-Z21</code>
						</section>
						<footer>
							<span>NOTICE</span>
							<p>
								Unauthorized access to pressure-control records is grounds for
								immediate card suspension.
							</p>
						</footer>
					</aside>
				</div>
				<footer className="login-footer">
					<span>ARO SECURE OPERATING ENVIRONMENT 4.8.12</span>
					<span>NO EXTERNAL UPLINK · CACHE INTEGRITY 71%</span>
				</footer>
			</div>
		</section>
	);
}

function RecordBlock({ code, title, alert = false, children }) {
	return (
		<section className={`record-block ${alert ? "record-block--alert" : ""}`}>
			<header>
				<span>{code}</span>
				<h2>{title}</h2>
				<small>{alert ? "ATTENTION" : "VERIFIED"}</small>
			</header>
			<div className="record-content">{children}</div>
		</section>
	);
}

function DataGrid({ items }) {
	return (
		<dl className="data-grid">
			{items.map(([key, value]) => (
				<div key={key}>
					<dt>{key}</dt>
					<dd>{value}</dd>
				</div>
			))}
		</dl>
	);
}

function AccessList({ title, items, denied = false }) {
	return (
		<section className={denied ? "denied" : ""}>
			<h3>{title}</h3>
			<ul>
				{items.map((item) => (
					<li key={item}>
						{denied ? "×" : "✓"} <span>{item}</span>
					</li>
				))}
			</ul>
		</section>
	);
}

const _recoveredLogs = [
	{
		time: "17 MAY 2025 17:31",
		author: "DANIEL_HUGHES",
		text: "Сегодня в дата-центре снова сбой… Но дело не в технике. Наши архивы сами пишут данные. Словно кто-то оставляет заметки в пустых файлах. Одна из них сказала: «Он уже дышит за твоей спиной». Это точно не розыгрыш.",
	},
	{
		time: "19 MAY 2025 07:13",
		author: "CPT_ANNA_SATORO",
		text: "Я видела это. Внизу, за стеклом камеры ARO-XXXX. Оно смотрело прямо на меня, хотя у него нет глаз. Оно знало. Я подала рапорт о неполадках, но его проигнорировали. Что-то готовится. Это... близко.",
	},
	{
		time: "19 MAY 2025 17:21",
		author: "MAYLS_KAUFMAN",
		text: "...в туннелях... что-то двигается. не техника. не вода. оно не должно быть здесь. скребёт по трубам... не звук, а... поиск, как будто хочет найти вход... или выход. я чувствую... взгляды. много. не мигают. не двигаются. только смотрят. всегда смотрят...",
	},
];

const englishRecoveredLogs = [
	{
		time: "17 MAY 2025 17:31",
		author: "DANIEL_HUGHES",
		text: "Another failure in the data center today... But this is not a technical problem. Our archives are writing data by themselves, as if someone were leaving notes inside empty files. One of them said: 'He is already breathing behind you.' This is definitely not a prank.",
	},
	{
		time: "19 MAY 2025 07:13",
		author: "CPT_ANNA_SATORO",
		text: "I saw it. Down below, behind the glass of camera ARO-XXXX. It looked directly at me, even though it had no eyes. It knew. I filed a malfunction report, but it was ignored. Something is preparing. It is... close.",
	},
	{
		time: "19 MAY 2025 17:21",
		author: "MAYLS_KAUFMAN",
		text: "...in the tunnels... something is moving. Not machinery. Not water. It should not be here. It is scraping along the pipes... not a sound, but... a search, as if it wants to find an entrance... or an exit. I can feel... eyes. So many. They do not blink. They do not move. They only watch. Always watching...",
	},
];

function LogCheckerApp() {
	const [stage, setStage] = useState(0);
	const [command, setCommand] = useState("");
	const [history, setHistory] = useState([
		"ARO DECIPHER SHELL 4.8.12",
		"Type 'help' for available commands.",
	]);
	const [decrypting, setDecrypting] = useState(false);
	const [decryptProgress, setDecryptProgress] = useState(67);
	const [selectedFile, setSelectedFile] = useState("core");
	const [terminalView, setTerminalView] = useState("terminal");
	const terminalRef = useRef(null);
	const documentScrollRef = useRef(null);
	const timersRef = useRef([]);
	useEffect(() => () => timersRef.current.forEach(window.clearTimeout), []);
	const run = (nextStage, message) => {
		setStage((current) => Math.max(current, nextStage));
		setHistory((lines) => [...lines, message]);
	};
	const openRecoveredLog = (index) => {
		setSelectedFile(`log-${index}`);
		window.requestAnimationFrame(() => {
			const container = documentScrollRef.current;
			const target = document.getElementById(`recovered-log-${index}`);
			if (!container || !target) return;
			const top =
				container.scrollTop +
				target.getBoundingClientRect().top -
				container.getBoundingClientRect().top -
				16;
			container.scrollTo({ top: Math.max(0, top), behavior: "smooth" });
		});
	};
	const startDecryption = () => {
		if (decrypting || stage < 2) return;
		setDecrypting(true);
		setHistory((lines) => [...lines, "> decrypt --all"]);
		const output = [
			"[00:00.114] Mounting corrupted archive volume... OK",
			"[00:00.482] Reading block map 2203-C... 16 sectors found",
			"[00:01.037] Loading MORSE_TX translation table... OK",
			"[00:01.428] Rebuilding damaged headers... 41%",
			"[00:01.906] Extracting DANIEL_HUGHES... OK",
			"[00:02.337] Extracting CPT_ANNA_SATORO... OK",
			"[00:02.811] Extracting MAYLS_KAUFMAN... OK",
			"[WARNING] Unknown signal detected in trailing data",
			"RESTORE COMPLETE // 3 LOGS RECOVERED",
		];
		output.forEach((line, index) => {
			const timer = window.setTimeout(
				() => {
					setHistory((lines) => [...lines, line]);
					setDecryptProgress(
						Math.min(100, 67 + Math.round(((index + 1) / output.length) * 33)),
					);
					terminalRef.current?.scrollTo({
						top: terminalRef.current.scrollHeight,
						behavior: "smooth",
					});
					if (index === output.length - 1) {
						setStage(3);
						setDecrypting(false);
					}
				},
				420 * (index + 1),
			);
			timersRef.current.push(timer);
		});
	};
	const submit = (event) => {
		event.preventDefault();
		const value = command.trim().toLowerCase();
		setCommand("");
		if (!value) return;
		if (value === "clear") return setHistory([]);
		const actions = {
			help: () =>
				setHistory((h) => [
					...h,
					"> " + value,
					"scan  verify  decrypt  status  clear",
				]),
			scan: () =>
				run(
					1,
					"> scan --file CORE-C4-TUNNELS.DAT\n3 recoverable blocks located.",
				),
			verify: () =>
				run(2, "> verify --block 2203-C\nMorse translation key accepted."),
			decrypt: startDecryption,
			status: () =>
				setHistory((h) => [
					...h,
					"> " + value,
					`Decryption progress: ${[8, 34, 67, 100][stage]}%`,
				]),
		};
		(
			actions[value] ||
			(() =>
				setHistory((h) => [...h, "> " + value, `Unknown command: ${value}`]))
		)();
		window.setTimeout(
			() => terminalRef.current?.scrollTo(0, terminalRef.current.scrollHeight),
			0,
		);
	};

	return (
		<section className="log-checker">
			<header className="log-toolbar">
				<div className="log-brand">
					<b>LC</b>
					<span>
						LOG CHECKER<small>ARO FORENSIC TOOLS</small>
					</span>
				</div>
				<div className="log-actions">
					<button
						type="button"
						onClick={() =>
							run(1, "Quick scan complete. 3 recoverable blocks located.")
						}
					>
						01 SCAN FILE
					</button>
					<button
						type="button"
						disabled={stage < 1}
						onClick={() =>
							run(2, "Block 2203-C verified. Translation key accepted.")
						}
					>
						02 VERIFY BLOCK
					</button>
					<button
						className="primary"
						type="button"
						disabled={stage < 2 || decrypting || stage === 3}
						onClick={startDecryption}
					>
						{decrypting ? "DECRYPTING..." : "03 DECRYPT"}
					</button>
				</div>
				<div
					className={`log-status stage-${stage} ${decrypting ? "is-running" : ""}`}
				>
					<i />
					{decrypting ? "PROCESSING" : stage === 3 ? "DECRYPTED" : "CORRUPTED"}
				</div>
			</header>
			<div className="log-workspace">
				<aside className="log-explorer">
					<h2>ARCHIVE EXPLORER</h2>
					<p>▾ REDACTED</p>
					<button
						className={selectedFile === "core" ? "selected" : ""}
						type="button"
						onClick={() => setSelectedFile("core")}
					>
						◇ CORE-C4-TUNNELS.DAT <small>TX!</small>
					</button>
					<button
						className={selectedFile === "system" ? "selected" : ""}
						type="button"
						onClick={() => setSelectedFile("system")}
					>
						◇ tech19.m.sys.log <small>ERR</small>
					</button>
					<p>▾ RECOVERED [{stage === 3 ? 3 : 0}]</p>
					{stage === 3 &&
						englishRecoveredLogs.map((log, index) => (
							<button
								className={`recovered-file ${selectedFile === `log-${index}` ? "selected" : ""}`}
								type="button"
								key={log.author}
								onClick={() => openRecoveredLog(index)}
							>
								└ LOG_0{index + 1}_{log.author} <small>OK</small>
							</button>
						))}
					<div className="integrity">
						<span>FILE INTEGRITY</span>
						<b>{decrypting ? decryptProgress : [8, 34, 67, 100][stage]}%</b>
						<i>
							<em
								style={{
									width: `${decrypting ? decryptProgress : [8, 34, 67, 100][stage]}%`,
								}}
							/>
						</i>
					</div>
				</aside>
				<main className="log-document">
					<div className="editor-tab">
						{selectedFile === "system"
							? "tech19.m.sys.log"
							: selectedFile.startsWith("log-")
								? `RECOVERED_LOG_0${Number(selectedFile.slice(4)) + 1}.txt`
								: "CORE-C4-TUNNELS.DAT"}{" "}
						<span>●</span>
					</div>
					<div className="document-scroll" ref={documentScrollRef}>
						<div className="document-meta">
							<span>CLASSIFIED // ARCHIVE NODE Z21-04</span>
							<b>TX_FILE_FAILURE_CORRUPTED</b>
						</div>
						<h1>CORE-C4 / TUNNEL SIGNAL LOG</h1>
						<pre className="system-lines">{`>>> RETRIEVE FILE: /archive/logs/redacted/CORE-C4-TUNNELS.DAT\n>>> STATUS: CORRUPTED\n[SYSTEM WARNING] — SOS SIGNAL FAILED\n[ERROR] — NO RESPONSE FROM MAIN HUB\n[TAG] — ENTITY PRESENCE CONFIRMED :: SECTOR T-17`}</pre>
						<section className={`cipher-block ${stage >= 2 ? "decoded" : ""}`}>
							<header>
								<span>BLOCK 2203-C</span>
								<b>{stage >= 2 ? "TRANSLATED" : "ENCRYPTED"}</b>
							</header>
							<code>
								- .... .. ... ..--.- - . -..- - ..--.- ..-. .. .-.. . ..--.- ..
								... ..--.- -.-. --- .-. .-. ..- .--. - . -..
							</code>
							{stage >= 2 && (
								<p>
									THIS_FILE_IS_CORRUPTED : ERROR : CODE : 2203 :
									DECRYPTION_ERROR
								</p>
							)}
						</section>
						{selectedFile === "system" && (
							<div className="system-file-notice">
								<b>tech19.m.sys.log</b>
								<span>Source process terminated unexpectedly.</span>
								<code>
									TX_FILE_FAILURE_CORRUPTED // MAIN HUB UNREACHABLE // SIGNAL
									LOST
								</code>
							</div>
						)}
						{stage < 3 ? (
							<div className="locked-logs">
								<span>[LOCKED]</span>
								<b>3 PERSONNEL LOGS ENCRYPTED</b>
								<small>
									{decrypting
										? "Decryption process running in terminal..."
										: "Run the decryption sequence to restore entries"}
								</small>
							</div>
						) : (
							englishRecoveredLogs.map((log, index) => (
								<article
									id={`recovered-log-${index}`}
									className={`recovered-log ${selectedFile === `log-${index}` ? "is-selected" : ""}`}
									key={log.author}
								>
									<header>
										<b>LOG 0{index + 1}</b>
										<span>{log.author}</span>
										<time>{log.time}</time>
									</header>
									<p>{log.text}</p>
								</article>
							))
						)}
						{stage === 3 && (
							<div className="final-entry">
								UNKNOWN ORIGIN // MESSAGE DETECTED IN STATIC
								<br />
								<b>"...do not close your eyes..."</b>
								<small>ALL SIGNALS LOST // END OF FILE</small>
							</div>
						)}
					</div>
				</main>
			</div>
			<section className="log-terminal">
				<header>
					<button
						className={`terminal-tab ${terminalView === "terminal" ? "active" : ""}`}
						type="button"
						onClick={() => setTerminalView("terminal")}
					>
						TERMINAL
					</button>
					<button
						className={`terminal-tab ${terminalView === "output" ? "active" : ""}`}
						type="button"
						onClick={() => setTerminalView("output")}
					>
						OUTPUT
					</button>
					<div className="terminal-tools">
						<button
							type="button"
							onClick={() => navigator.clipboard?.writeText(history.join("\n"))}
						>
							COPY OUTPUT
						</button>
						<button type="button" onClick={() => setHistory([])}>
							CLEAR
						</button>
					</div>
					<b>
						{terminalView === "terminal" ? "DECIPHER SHELL" : "PROCESS LOG"}
					</b>
				</header>
				<div
					className="terminal-output"
					ref={terminalRef}
					tabIndex="0"
					aria-label="Decryption terminal output"
				>
					{(terminalView === "output"
						? history.filter(
								(line) =>
									line.includes("[") ||
									line.includes("COMPLETE") ||
									line.includes("located") ||
									line.includes("accepted"),
							)
						: history
					).map((line, index) => (
						<pre key={`${line}-${index}`}>{line}</pre>
					))}
				</div>
				{terminalView === "terminal" ? (
					<form onSubmit={submit}>
						<label>aro@z21:~/redacted $</label>
						<input
							value={command}
							onChange={(e) => setCommand(e.target.value)}
							placeholder="enter command..."
							autoComplete="off"
							aria-label="Terminal command"
						/>
						<button type="submit">RUN ↵</button>
					</form>
				) : (
					<footer className="output-footer">
						READ-ONLY PROCESS OUTPUT // {history.length} EVENTS CAPTURED
					</footer>
				)}
			</section>
		</section>
	);
}

function VisionApp() {
	const [activeContact, setActiveContact] = useState("Margarite Chen");
	return (
		<section className="vision-app">
			<aside className="vision-sidebar">
				<div className="vision-mark">V</div>
				{["Profile", "Messages", "Channels"].map((label) => (
					<button type="button" key={label}>
						<img src={asset("files/img/profile-user.png")} alt="" />
						<span>{label}</span>
					</button>
				))}
				<small>
					LOCAL NODE
					<br />
					Z21-04
				</small>
			</aside>
			<div className="vision-contacts">
				<header>
					<span>DIRECT CHANNELS</span>
					<b>2</b>
				</header>
				{["Margarite Chen", "Bart Kowalski"].map((contact, index) => (
					<button
						type="button"
						className={activeContact === contact ? "active" : ""}
						key={contact}
						onClick={() => setActiveContact(contact)}
					>
						<img src={asset("files/img/manager.png")} alt="" />
						<span>
							<strong>{contact}</strong>
							<small>{index ? "SIGNAL LOST" : "LAST SEEN 23:31"}</small>
						</span>
					</button>
				))}
			</div>
			<div className="vision-chat">
				<header>
					<div>
						<strong>{activeContact}</strong>
						<span>SECURE INTERNAL CHANNEL</span>
					</div>
					<b>OFFLINE</b>
				</header>
				<main>
					<div className="channel-date">14 DEC 2024 · INCIDENT NIGHT</div>
					<p>
						<span>23:28</span> Pressure readings are drifting again. D-sector
						instruments disagree with the locks.
					</p>
					<p>
						<span>23:31</span> Ryo went below to check the manual array. No
						response on maintenance frequency.
					</p>
					<div className="channel-alert">
						NETWORK ISOLATION ACTIVE
						<br />
						<small>MESSAGES CANNOT BE DELIVERED</small>
					</div>
				</main>
				<footer>
					<input disabled placeholder="Channel unavailable" />
					<button type="button" disabled>
						SEND
					</button>
				</footer>
			</div>
		</section>
	);
}

function StartMenu({ open, toggleWindow }) {
	return (
		<section className={`start-menu ${open ? "is-open" : ""}`}>
			<div className="start-menu-main">
				<section className="start-apps">
					<label className="menu-search">
						<span className="search-mark">Search</span>
						<input type="text" placeholder="Type here to search" />
					</label>
					<div className="menu-app-grid">
						{menuApps.map((app) => (
							<button
								type="button"
								key={app.id}
								onClick={() => toggleWindow(app.id)}
							>
								<img
									className={app.invert ? "invert" : ""}
									src={asset(app.icon)}
									alt=""
								/>
								<span>{app.label}</span>
							</button>
						))}
					</div>
				</section>
				<section className="news-list">
					{[
						[
							"SECTOR D-Z21 ISOLATED",
							"Emergency pressure protocol remains active. All transit to lower technical levels is suspended.",
						],
						[
							"NETWORK DEGRADED",
							"External uplink unavailable. Personnel records are operating from the last verified local cache.",
						],
						[
							"CONTAMINATION NOTICE",
							"Respiratory protection is mandatory near sewage shafts, drainage routes, and metro access tunnels.",
						],
					].map(([title, copy], item) => (
						<article key={title}>
							<img src={asset("files/img/document.png")} alt="" />
							<div>
								<small>ARO BULLETIN 0{item + 1}</small>
								<h2>{title}</h2>
								<p>{copy}</p>
							</div>
						</article>
					))}
				</section>
			</div>
			<footer className="start-menu-footer">
				<div className="operator-identity">
					<img src={asset("files/img/profile-user.png")} alt="" />
					<span>ARO-Z21 Local Operator</span>
				</div>
				<button type="button" title="Power">
					<img src={asset("files/img/power.png")} alt="" />
				</button>
			</footer>
		</section>
	);
}

function MediaOverlay({ media, onClose }) {
	return (
		<div className="media-overlay" onClick={onClose}>
			<button type="button" className="media-close" onClick={onClose}>
				Close
			</button>
			<div
				className={`media-frame media-frame--${media.type}`}
				onClick={(event) => event.stopPropagation()}
			>
				{media.type === "video" && (
					<video src={asset(media.src)} controls autoPlay />
				)}
				{media.type === "audio" && (
					<div className="audio-player">
						<h2>Now Playing: {media.title}</h2>
						<audio src={asset(media.src)} controls autoPlay />
					</div>
				)}
				{media.type === "pdf" && (
					<embed
						src={asset(media.src)}
						type="application/pdf"
						title={media.title}
					/>
				)}
			</div>
		</div>
	);
}

function SelectionBox({ selection }) {
	if (!selection.active) return null;
	const left = Math.min(selection.x1, selection.x2);
	const top = Math.min(selection.y1, selection.y2);
	const width = Math.abs(selection.x2 - selection.x1);
	const height = Math.abs(selection.y2 - selection.y1);
	if (width < 5 && height < 5) return null;
	return <div className="selection-box" style={{ left, top, width, height }} />;
}

function useDateTime() {
	const [date, setDate] = useState(() => new Date());

	useEffect(() => {
		const interval = window.setInterval(() => setDate(new Date()), 1000);
		return () => window.clearInterval(interval);
	}, []);

	return {
		iso: date.toISOString(),
		date: new Intl.DateTimeFormat("pl-PL").format(date),
		time: new Intl.DateTimeFormat("pl-PL", {
			hour: "2-digit",
			minute: "2-digit",
		}).format(date),
	};
}

function useViewportScale() {
	const measure = () => {
		const expanded = window.innerWidth >= 1920 && window.innerHeight >= 1080;
		const screenRatio = Math.min(
			window.innerWidth / 1920,
			window.innerHeight / 1080,
		);
		const scale = expanded
			? Math.min(1.18, 1 + (screenRatio - 1) * 0.32)
			: screenRatio;
		const width = expanded ? window.innerWidth / scale : 1920;
		const height = expanded ? window.innerHeight / scale : 1080;
		return {
			scale,
			expanded,
			width,
			height,
			left: expanded ? 0 : Math.max(0, (window.innerWidth - 1920 * scale) / 2),
			top: expanded ? 0 : Math.max(0, (window.innerHeight - 1080 * scale) / 2),
		};
	};
	const [viewport, setViewport] = useState(measure);

	useEffect(() => {
		const update = () => setViewport(measure());
		window.addEventListener("resize", update);
		return () => window.removeEventListener("resize", update);
	}, []);

	return viewport;
}

function clamp(value, min, max) {
	return Math.min(Math.max(value, min), max);
}

function getResponsiveWindowGrowth(desktopWidth, desktopHeight) {
	return Math.min(
		1.4,
		Math.max(1, Math.min(desktopWidth / 1920, desktopHeight / 1008)),
	);
}

function getRestoreState(win) {
	return {
		x: win.x,
		y: win.y,
		width: win.width,
		height: win.height,
		maximized: win.maximized,
	};
}

export default App;
