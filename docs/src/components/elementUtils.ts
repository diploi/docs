import type { AllElementsAvailable, DiploiElement } from './types';

export const diploiElementList = async () => {
    const { result: { data } } = await fetch(
        `${import.meta.env.API_URL || "https://console.diploi.com"}/api/trpc/stack.listPreviewComponents`,
    ).then((response) => response.json());
    return data.components
}

export const extractElement = (elementList: DiploiElement[], elementToExtract: AllElementsAvailable) => {
    const extractedElement = elementList.filter(element => element.identifier === elementToExtract)[0]
    return extractedElement
}