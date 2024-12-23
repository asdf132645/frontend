const disableScroll = () => {
    document.body.style.overflow = 'hidden';
}

const enableScroll = () => {
    document.body.style.overflow = 'auto';
}

const scrollToTop = () => {
    window.scrollTo({top: 0, behavior: 'smooth'});
}

export { disableScroll, enableScroll, scrollToTop };