/**
 * Represents a 3D object in the scene.
 */
export interface Object3D {
    /**
     * Gets the ID of the object.
     * @returns The ID of the object.
     */
    getId(): string;
  
    /**
     * Checks if the object is visible.
     * @returns True if the object is visible, false otherwise.
     */
    getIsVisible(): boolean;
  
    /**
     * Sets the visibility of the object.
     */
    toggleIsVisible(): void;
  
    /**
     * Checks if the object is movable.
     * @returns True if the object is movable, false otherwise.
     */
    getIsMovable(): boolean;
  
    /**
     * Sets the movability of the object.
     */
    toggleIsMovable(): void;
  
    /**
     * Moves the object in 3D space.
     * @param x - The amount to move along the x-axis.
     * @param y - The amount to move along the y-axis.
     * @param z - The amount to move along the z-axis.
     */
    move(x: number, y: number, z: number): void;
  }
  